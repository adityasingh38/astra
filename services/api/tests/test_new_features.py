import asyncio

import pytest
import httpx
from fastapi.testclient import TestClient

from app.derived import antardashas, divisional_sign
from app.engine import calculate
from app.interpretation import ReadingRequest, facts_for, generate_reading, validate_reading
from app.main import app
from app.models import BirthProfile
from app.timezone import resolve_utc


def sample_chart():
    profile = BirthProfile(name="Example", birth_date="2002-06-21", birth_time="20:20:00", timezone="Asia/Kolkata", latitude=9.9312, longitude=76.2673, place_label="Kochi, India")
    instant, warnings = resolve_utc(profile)
    return calculate(profile, instant, warnings)


def test_divisional_mapping_and_dasha_coverage():
    assert divisional_sign(0, 9)["sign"] == "Aries"
    assert divisional_sign(30, 9)["sign"] == "Capricorn"
    assert divisional_sign(30, 10)["sign"] == "Capricorn"
    chart = sample_chart()
    assert chart["vedic"]["divisional"]["D9"]["positions"]["Moon"]["sign"]
    assert chart["vedic"]["divisional"]["D10"]["ascendant"]
    periods = antardashas(chart["vedic"]["mahadashas"][0])
    assert len(periods) == 9
    assert periods[0]["start_utc"] == chart["vedic"]["mahadashas"][0]["start_utc"]
    assert periods[-1]["end_utc"] == chart["vedic"]["mahadashas"][0]["end_utc"]


def test_reading_rejects_unverified_content():
    facts = facts_for(sample_chart(), "western", "love")
    first = next(iter(facts))
    good = {"title": "A reflective reading", "sentences": [{"text": "You may seek closeness through patient conversation.", "fact_ids": [first]}, {"text": "Notice what helps you feel heard and at ease.", "fact_ids": [first]}]}
    assert validate_reading(good, facts).title
    with pytest.raises(ValueError, match="unknown fact"):
        validate_reading({**good, "sentences": [{"text": "You may seek closeness through patient conversation.", "fact_ids": ["fake"]}, good["sentences"][1]]}, facts)
    with pytest.raises(ValueError, match="chart label"):
        validate_reading({**good, "sentences": [{"text": "Venus in Gemini guarantees a perfect match.", "fact_ids": [first]}, good["sentences"][1]]}, facts)


def test_unknown_time_excludes_moon_from_reading_facts():
    chart = sample_chart()
    chart["birth_profile"]["time_known"] = False
    facts = facts_for(chart, "vedic", "love")
    assert "vedic.moon" not in facts
    assert "vedic.nakshatra" not in facts


def test_ai_reading_rejects_ephemeris_fallback():
    from fastapi import HTTPException
    chart = sample_chart()
    chart["western"]["warnings"].append("Moshier fallback was used")
    with pytest.raises(HTTPException) as error:
        asyncio.run(generate_reading(chart, ReadingRequest(lens="western", topic="identity")))
    assert error.value.status_code == 422


def test_ai_reading_reports_exhausted_credits(monkeypatch):
    from fastapi import HTTPException
    from app import interpretation
    monkeypatch.setenv("OPENAI_API_KEY", "test-only")

    class Upstream:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *_):
            pass
        async def post(self, *_args, **_kwargs):
            return httpx.Response(429, json={"error": {"code": "credit_balance_exhausted"}}, request=httpx.Request("POST", "https://api.openai.com/v1/responses"))

    monkeypatch.setattr(interpretation.httpx, "AsyncClient", lambda **_kwargs: Upstream())
    with pytest.raises(HTTPException) as error:
        asyncio.run(generate_reading(sample_chart(), ReadingRequest(lens="western", topic="identity")))
    assert error.value.status_code == 503
    assert "credits" in error.value.detail


def test_personal_chart_requires_authentication(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "example")
    response = TestClient(app).post("/charts/dual", json=sample_chart()["birth_profile"])
    assert response.status_code == 401


def test_birthplace_timezone_lookup():
    from app.geocoding import _zones
    assert _zones.timezone_at(lat=9.9312, lng=76.2673) == "Asia/Kolkata"
