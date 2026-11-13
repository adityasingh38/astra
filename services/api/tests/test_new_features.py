from copy import deepcopy

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.derived import antardashas, divisional_sign
from app.engine import SIGNS, calculate
from app.interpretation import ReadingRequest, compose_reading, facts_for
from app.main import app
from app.models import BirthProfile
from app.reading_catalog import ASPECT_PASSAGES, D9_PASSAGES, ROLE_PASSAGES, SIGN_PASSAGES, TOPIC_BODIES
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


def test_catalog_covers_every_supported_placement():
    for topic, bodies in TOPIC_BODIES.items():
        assert set(SIGN_PASSAGES[topic]) == set(SIGNS)
        for lens in ("western", "vedic"):
            assert set(ROLE_PASSAGES[lens][topic]) == set(bodies)
    assert set(D9_PASSAGES) == set(SIGNS)
    assert set(ASPECT_PASSAGES) == {"conjunction", "sextile", "square", "trine", "opposition"}


def test_every_reading_is_an_authored_collection_with_cited_facts():
    chart = sample_chart()
    for lens in ("western", "vedic"):
        for topic in ("identity", "love", "career"):
            result = compose_reading(chart, ReadingRequest(lens=lens, topic=topic))
            assert result["source"] == "astra_catalog"
            assert 2 <= len(result["reading"]["entries"]) <= 5
            for entry in result["reading"]["entries"]:
                assert entry["passage_ids"]
                assert all(fact_id in result["facts"] for fact_id in entry["fact_ids"])
    vedic_love = compose_reading(chart, ReadingRequest(lens="vedic", topic="love"))
    assert any("vedic.d9_venus" in entry["fact_ids"] for entry in vedic_love["reading"]["entries"])


def test_unknown_birth_time_excludes_sensitive_passages():
    chart = sample_chart()
    chart["birth_profile"]["time_known"] = False
    assert "vedic.moon" not in facts_for(chart, "vedic", "love")
    result = compose_reading(chart, ReadingRequest(lens="vedic", topic="love"))
    assert len(result["reading"]["entries"]) == 2
    assert all("moon" not in fact_id and "d9" not in fact_id for entry in result["reading"]["entries"] for fact_id in entry["fact_ids"])


def test_sign_and_lens_change_selected_passages():
    chart = sample_chart()
    request = ReadingRequest(lens="western", topic="identity")
    first = compose_reading(chart, request)["reading"]["entries"][0]["text"]
    edited = deepcopy(chart)
    original = chart["western"]["positions"]["Sun"]["sign"]
    edited["western"]["positions"]["Sun"]["sign"] = "Aries" if original != "Aries" else "Taurus"
    second = compose_reading(edited, request)["reading"]["entries"][0]["text"]
    assert first != second
    vedic = compose_reading(chart, ReadingRequest(lens="vedic", topic="identity"))["reading"]["entries"][0]["text"]
    assert vedic != first


def test_reading_rejects_unverified_chart():
    chart = sample_chart()
    chart["western"]["warnings"].append("Moshier fallback was used")
    with pytest.raises(HTTPException) as error:
        compose_reading(chart, ReadingRequest(lens="western", topic="identity"))
    assert error.value.status_code == 422


def test_personal_chart_requires_authentication(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "example")
    response = TestClient(app).post("/charts/dual", json=sample_chart()["birth_profile"])
    assert response.status_code == 401


def test_birthplace_timezone_lookup():
    from app.geocoding import _zones
    assert _zones.timezone_at(lat=9.9312, lng=76.2673) == "Asia/Kolkata"
