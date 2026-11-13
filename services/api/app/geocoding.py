import asyncio
import os
import time

import httpx
from fastapi import HTTPException
from timezonefinder import TimezoneFinder

_lock = asyncio.Lock()
_last_request = 0.0
_cache: dict[str, tuple[float, list[dict]]] = {}
_zones = TimezoneFinder(in_memory=True)


async def search_places(query: str) -> list[dict]:
    global _last_request
    name = query.strip()
    if len(name) < 3 or len(name) > 100:
        raise HTTPException(422, "Search for a city and country (3–100 characters)")
    key = name.casefold()
    async with _lock:
        cached = _cache.get(key)
        if cached and time.monotonic() - cached[0] < 86400:
            return cached[1]
        delay = 1.1 - (time.monotonic() - _last_request)
        if delay > 0:
            await asyncio.sleep(delay)
        _last_request = time.monotonic()
        base = os.getenv("GEOCODING_URL", "https://nominatim.openstreetmap.org/search")
        agent = os.getenv("GEOCODING_USER_AGENT")
        if not agent:
            raise HTTPException(503, "Set GEOCODING_USER_AGENT with an app contact before using birthplace search")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(base, params={"q": name, "format": "jsonv2", "limit": 5, "addressdetails": 1}, headers={"User-Agent": agent})
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(503, "Birthplace lookup unavailable") from exc
        found = []
        for item in response.json():
            latitude, longitude = float(item["lat"]), float(item["lon"])
            found.append({"label": item["display_name"], "latitude": latitude, "longitude": longitude, "timezone": _zones.timezone_at(lat=latitude, lng=longitude), "source": "OpenStreetMap Nominatim"})
        _cache[key] = (time.monotonic(), found)
        return found
