from datetime import date

from app.engine import calculate
from app.models import BirthProfile
from app.relationships import compatibility, cross_aspects, transits
from app.timezone import resolve_utc


def make_profile(name="A", known=True):
    return BirthProfile(name=name, birth_date="2002-06-21", birth_time="20:20" if known else None, time_known=known, timezone="Asia/Kolkata", latitude=9.9312, longitude=76.2673, place_label="Kochi")


def chart(profile):
    instant, warnings = resolve_utc(profile)
    return calculate(profile, instant, warnings)


def test_cross_aspect_orb_and_wraparound():
    result = cross_aspects({"Sun": {"longitude": 359}}, {"Moon": {"longitude": 1}}, orb_cap=2)
    assert result == [{"first": "Sun", "second": "Moon", "aspect": "conjunction", "orb": 2}]


def test_connections_omit_untimed_moon():
    first, second = chart(make_profile()), chart(make_profile("B", False))
    result = compatibility(first, second)
    assert result["vedic"]["moon_nakshatras"] is None
    assert all(item["first"] != "Moon" and item["second"] != "Moon" for item in result["western"]["synastry_aspects"])
    assert result["warnings"]


def test_transit_snapshot_is_calculated_and_untimed_moon_omitted():
    profile = make_profile(known=False)
    result = transits(profile, chart(profile), date(2026, 11, 13))
    assert result["sample_time_utc"] == "2026-11-13T06:30:00+00:00"
    assert result["date_local"] == "2026-11-13"
    assert result["vedic"]["moon_nakshatra"]["name"]
    assert all(item["second"] != "Moon" for item in result["western"]["natal_aspects"])
