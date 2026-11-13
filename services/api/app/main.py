from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .auth import bearer_token, current_user
from .engine import calculate
from .geocoding import search_places
from .interpretation import ReadingRequest, generate_reading
from .models import BirthProfile
from .storage import ProfileStore, row_to_profile
from .timezone import BirthTimeError, resolve_utc

app = FastAPI(title="ASTRA calculation API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:8081", "http://127.0.0.1:8081"], allow_methods=["GET", "POST", "DELETE"], allow_headers=["Authorization", "Content-Type"])


@app.get("/health")
def health():
    return {"status": "ok"}


def _chart(profile: BirthProfile):
    try:
        birth_utc, warnings = resolve_utc(profile)
        return calculate(profile, birth_utc, warnings)
    except BirthTimeError as exc:
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
    row = await ProfileStore(bearer_token(authorization)).get(profile_id)
    return _chart(row_to_profile(row))


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
    return await generate_reading(_chart(row_to_profile(row)), request)
