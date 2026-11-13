import os
from uuid import UUID

import httpx
from fastapi import HTTPException

from .models import BirthProfile


class ProfileStore:
    def __init__(self, token: str):
        url = os.getenv("SUPABASE_URL", "").rstrip("/")
        key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
        if not url or not key:
            raise HTTPException(503, "Supabase is not configured")
        self.url = f"{url}/rest/v1/birth_profiles"
        self.headers = {"apikey": key, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async def list(self) -> list[dict]:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(self.url, headers=self.headers, params={"select": "*", "order": "created_at.desc"})
        self._check(response)
        return response.json()

    async def get(self, profile_id: UUID) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(self.url, headers=self.headers, params={"id": f"eq.{profile_id}", "select": "*", "limit": "1"})
        self._check(response)
        rows = response.json()
        if not rows:
            raise HTTPException(404, "Birth profile not found")
        return rows[0]

    async def create(self, profile: BirthProfile, user_id: str) -> dict:
        row = {"user_id": user_id, "preferred_name": profile.name, "birth_date": profile.birth_date.isoformat(), "birth_time": profile.birth_time.isoformat() if profile.birth_time else None, "time_known": profile.time_known, "timezone_id": profile.timezone, "fold": profile.fold, "latitude": profile.latitude, "longitude": profile.longitude, "place_label": profile.place_label, "western_houses": profile.western_houses, "ayanamsa": profile.ayanamsa, "node_mode": profile.node_mode}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(self.url, headers={**self.headers, "Prefer": "return=representation"}, json=row)
        self._check(response)
        return response.json()[0]

    async def delete(self, profile_id: UUID) -> None:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.delete(self.url, headers=self.headers, params={"id": f"eq.{profile_id}"})
        self._check(response)

    @staticmethod
    def _check(response: httpx.Response) -> None:
        if response.status_code == 401:
            raise HTTPException(401, "Database token expired")
        if response.status_code >= 400:
            raise HTTPException(502, "Profile storage unavailable")


def row_to_profile(row: dict) -> BirthProfile:
    return BirthProfile(name=row["preferred_name"], birth_date=row["birth_date"], birth_time=row["birth_time"], time_known=row["time_known"], timezone=row["timezone_id"], fold=row["fold"], latitude=row["latitude"], longitude=row["longitude"], place_label=row["place_label"], western_houses=row["western_houses"], ayanamsa=row["ayanamsa"], node_mode=row["node_mode"])
