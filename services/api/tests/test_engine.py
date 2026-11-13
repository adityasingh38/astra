from datetime import date, datetime, time, timezone

import pytest

from app.engine import calculate, mahadashas, nakshatra
from app.models import BirthProfile
from app.timezone import BirthTimeError, resolve_utc


def profile(**overrides):
    values = dict(name="Regression", birth_date=date(2002, 6, 21), birth_time=time(20, 20), time_known=True, timezone="Asia/Kolkata", latitude=9.9312, longitude=76.2673, place_label="Kochi, India")
    values.update(overrides)
    return BirthProfile(**values)


def test_kochi_utc_conversion():
    instant, warnings = resolve_utc(profile())
    assert instant == datetime(2002, 6, 21, 14, 50, tzinfo=timezone.utc)
    assert warnings == []


def test_dst_gap_and_fold():
    with pytest.raises(BirthTimeError, match="does not exist"):
        resolve_utc(profile(birth_date=date(2024, 3, 10), birth_time=time(2, 30), timezone="America/New_York"))
    ambiguous = profile(birth_date=date(2024, 11, 3), birth_time=time(1, 30), timezone="America/New_York")
    with pytest.raises(BirthTimeError, match="ambiguous"):
        resolve_utc(ambiguous)
    earlier, _ = resolve_utc(ambiguous.model_copy(update={"fold": 0}))
    later, _ = resolve_utc(ambiguous.model_copy(update={"fold": 1}))
    assert (later - earlier).total_seconds() == 3600


def test_nakshatra_boundary_and_dasha_fraction():
    assert nakshatra(0)["name"] == "Ashwini"
    assert nakshatra(360 / 27)["name"] == "Bharani"
    assert nakshatra(360 - 1e-8)["name"] == "Revati"
    born = datetime(2000, 1, 1, tzinfo=timezone.utc)
    periods = mahadashas(0, born)
    assert periods[0]["ruler"] == "Ketu"
    assert periods[0]["start_utc"] == born.isoformat()
    assert periods[0]["current_at_birth"]


def test_dual_chart_and_unknown_time():
    known = profile()
    instant, warnings = resolve_utc(known)
    result = calculate(known, instant, warnings)
    assert result["western"]["zodiac"] == "tropical"
    assert result["vedic"]["zodiac"] == "sidereal"
    assert result["western"]["positions"]["Sun"]["longitude"] != result["vedic"]["positions"]["Sun"]["longitude"]
    assert result["vedic"]["moon_nakshatra"]["pada"] in (1, 2, 3, 4)
    assert len(result["vedic"]["mahadashas"]) == 10
    assert result["western"]["metadata"]["birth_utc"] == instant.isoformat()
    unknown = profile(birth_time=None, time_known=False)
    instant, warnings = resolve_utc(unknown)
    result = calculate(unknown, instant, warnings)
    assert result["western"]["houses"] is None
    assert result["vedic"]["houses"] is None
    assert result["vedic"]["mahadashas"] is None


def test_geocentric_positions_against_jpl_horizons():
    # JPL Horizons observer=500@399, quantities=31, ecliptic of date,
    # 2002-06-21 14:50 UT. See docs/VERIFICATION.md for the full query.
    instant, warnings = resolve_utc(profile())
    chart = calculate(profile(), instant, warnings)
    reference = {"Sun": 90.0566950, "Moon": 227.7886935, "Mars": 105.7776516}
    for body, longitude in reference.items():
        assert abs(chart["western"]["positions"][body]["longitude"] - longitude) < 0.001
        assert chart["western"]["metadata"]["actual_ephemeris_flags"][body] & 2


def test_houses_nodes_and_ayanamsa_settings():
    known = profile(western_houses="whole_sign", ayanamsa="raman", node_mode="mean")
    instant, warnings = resolve_utc(known)
    result = calculate(known, instant, warnings)
    assert len(result["western"]["houses"]["cusps"]) == 12
    assert len(result["vedic"]["houses"]["cusps"]) == 12
    assert result["western"]["house_system"] == "whole_sign"
    assert result["vedic"]["metadata"]["ayanamsa"] == "raman"
    assert abs((result["vedic"]["positions"]["Ketu"]["longitude"] - result["vedic"]["positions"]["Rahu"]["longitude"]) % 360 - 180) < 1e-4


def test_polar_placidus_failure_is_graceful():
    polar = profile(latitude=89.0, western_houses="placidus")
    instant, warnings = resolve_utc(polar)
    result = calculate(polar, instant, warnings)
    assert result["western"]["houses"] is None
    assert any("House calculation unavailable" in text for text in result["western"]["warnings"])
