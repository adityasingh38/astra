from datetime import date
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.numerology import ASSOCIATIONS, READINGS, moolank_for


def test_moolank_reduces_only_the_day_of_birth():
    assert moolank_for(date(2002, 6, 21))["calculation"]["steps"] == [21, 3]
    assert moolank_for(date(1999, 12, 29))["calculation"]["steps"] == [29, 11, 2]
    assert moolank_for(date(2020, 1, 29))["number"] == 2
    assert moolank_for(date(2001, 1, 10))["number"] == 1
    assert moolank_for(date(2001, 1, 31))["number"] == 4


def test_all_nine_numbers_have_authored_readings_and_associations():
    assert set(ASSOCIATIONS) == set(READINGS) == set(range(1, 10))
    for day in range(1, 10):
        result = moolank_for(date(2000, 1, day))
        assert result["number"] == day
        assert result["source"] == "astra_catalog"
        assert len(result["reading"]["entries"]) == 3
        assert all(entry["heading"] and entry["text"] for entry in result["reading"]["entries"])


def test_saved_moolank_requires_authentication(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "example")
    response = TestClient(app).get(f"/birth-profiles/{uuid4()}/moolank")
    assert response.status_code == 401
