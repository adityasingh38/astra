from uuid import UUID
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo
from collections import defaultdict, deque
from hashlib import sha256
from threading import Lock
from time import perf_counter
from uuid import uuid4
import logging
import os

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .auth import bearer_token, current_user
from .engine import calculate, verified_ephemeris_path
from .geocoding import search_places
from .interpretation import ReadingRequest, compose_reading
from .models import BirthProfile
from .numerology import moolank_for
from .relationships import compatibility, transits
from .storage import ProfileStore, row_to_profile
from .timezone import BirthTimeError, resolve_utc

app = FastAPI(title="ASTRA calculation API", version="0.3.0")
allowed_origins = ["http://localhost:8081", "http://127.0.0.1:8081"]
allowed_origins.extend(origin.strip() for origin in os.getenv("ASTRA_ALLOWED_ORIGINS", "").split(",") if origin.strip())
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"])
_rate_lock = Lock()
_rate_events: dict[tuple[str, str], deque] = defaultdict(deque)
logger = logging.getLogger("astra.api")


@app.middleware("http")
async def request_metrics(request: Request, call_next):
    request_id = str(uuid4())
    start = perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request_failed id=%s method=%s", request_id, request.method)
        raise
    response.headers["X-Request-ID"] = request_id
    route = getattr(request.scope.get("route"), "path", "unmatched")
    logger.info("request id=%s method=%s route=%s status=%s duration_ms=%.1f", request_id, request.method, route, response.status_code, (perf_counter() - start) * 1000)
    return response


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    path = request.url.path
    category = "readings" if path.endswith("/readings") else "places" if path == "/places/search" else None
    if category:
        token = request.headers.get("authorization", "")
        identity = sha256((token or (request.client.host if request.client else "unknown")).encode()).hexdigest()
        key = (category, identity)
        now = datetime.now(timezone.utc).timestamp()
        with _rate_lock:
            events = _rate_events[key]
            while events and events[0] < now - 60:
                events.popleft()
            if len(events) >= (30 if category == "readings" else 10):
                return JSONResponse(status_code=429, content={"detail": "Rate limit reached; retry in a minute"}, headers={"Retry-After": "60"})
            events.append(now)
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def ready():
    missing = [name for name in ("SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY") if not os.getenv(name)]
    try:
        verified_ephemeris_path()
    except ValueError:
        missing.append("pinned ephemeris")
    if missing:
        raise HTTPException(503, {"not_ready": missing})
    return {"status": "ready", "ephemeris": "verified"}


def _chart(profile: BirthProfile):
    try:
        birth_utc, warnings = resolve_utc(profile)
        return calculate(profile, birth_utc, warnings)
    except BirthTimeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Calculation unavailable") from exc


@app.post("/charts/dual")
def dual_chart(profile: BirthProfile, _user: str = Depends(current_user)):
    return _chart(profile)


@app.get("/places/search")
async def places_search(q: str = Query(min_length=3, max_length=100), _user: str = Depends(current_user)):
    return await search_places(q)


@app.get("/birth-profiles")
async def list_profiles(_user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    return await ProfileStore(bearer_token(authorization)).list()


@app.post("/birth-profiles", status_code=201)
async def create_profile(profile: BirthProfile, user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    # Validate the time before persisting an unusable profile.
    try:
        resolve_utc(profile)
    except BirthTimeError as exc:
        raise HTTPException(422, str(exc)) from exc
    return await ProfileStore(bearer_token(authorization)).create(profile, user)


@app.get("/birth-profiles/{profile_id}/chart")
async def profile_chart(profile_id: UUID, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    store = ProfileStore(bearer_token(authorization))
    row = await store.get(profile_id)
    chart = _chart(row_to_profile(row))
    await store.save_chart(profile_id, chart)
    return chart


@app.get("/birth-profiles/{profile_id}/moolank")
async def profile_moolank(profile_id: UUID, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    return moolank_for(date.fromisoformat(row["birth_date"]))


@app.patch("/birth-profiles/{profile_id}")
async def update_profile(profile_id: UUID, profile: BirthProfile, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    try:
        resolve_utc(profile)
    except BirthTimeError as exc:
        raise HTTPException(422, str(exc)) from exc
    store = ProfileStore(bearer_token(authorization))
    await store.get(profile_id)
    return await store.update(profile_id, profile)


@app.get("/birth-profiles/{profile_id}/transits")
async def profile_transits(profile_id: UUID, day: date | None = None, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    profile = row_to_profile(row)
    try:
        return transits(profile, _chart(profile), day or datetime.now(ZoneInfo(profile.timezone)).date())
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@app.get("/birth-profiles/{profile_id}/connections/{other_id}")
async def profile_connections(profile_id: UUID, other_id: UUID, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    if profile_id == other_id:
        raise HTTPException(422, "Choose two different birth profiles")
    store = ProfileStore(bearer_token(authorization))
    first = await store.get(profile_id)
    second = await store.get(other_id)
    return compatibility(_chart(row_to_profile(first)), _chart(row_to_profile(second)))


@app.get("/privacy/export")
async def privacy_export(_user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    return await ProfileStore(bearer_token(authorization)).export()


@app.get("/birth-profiles/{profile_id}/divisional/{division}")
async def profile_divisional(profile_id: UUID, division: str, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    if division.upper() not in ("D9", "D10"):
        raise HTTPException(404, "Only D9 and D10 are implemented")
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    return _chart(row_to_profile(row))["vedic"]["divisional"][division.upper()]


@app.get("/birth-profiles/{profile_id}/dashas")
async def profile_dashas(profile_id: UUID, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    chart = _chart(row_to_profile(row))["vedic"]
    return {"mahadashas": chart["mahadashas"], "antardashas": chart["antardashas"], "year_convention": "365.25 ephemeris days"}


@app.delete("/birth-profiles/{profile_id}", status_code=204)
async def delete_profile(profile_id: UUID, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    store = ProfileStore(bearer_token(authorization))
    await store.get(profile_id)
    await store.delete(profile_id)


@app.post("/birth-profiles/{profile_id}/readings")
async def profile_reading(profile_id: UUID, request: ReadingRequest, _user: str = Depends(current_user), authorization: str | None = Header(default=None)):
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    return compose_reading(_chart(row_to_profile(row)), request)
