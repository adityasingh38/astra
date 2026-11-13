import os

import httpx
from fastapi import Header, HTTPException


async def current_user(authorization: str | None = Header(default=None)) -> str:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    if not url or not key:
        raise HTTPException(503, "Supabase is not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Bearer token required")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(401, "Bearer token required")
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(f"{url}/auth/v1/user", headers={"apikey": key, "Authorization": f"Bearer {token}"})
    except httpx.HTTPError as exc:
        raise HTTPException(503, "Auth service unavailable") from exc
    if response.status_code != 200 or not response.json().get("id"):
        raise HTTPException(401, "Invalid or expired token")
    return response.json()["id"]


def bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Bearer token required")
    return authorization.removeprefix("Bearer ").strip()
