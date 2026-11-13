from datetime import datetime, timedelta, timezone
from math import floor
import os
import hashlib
from pathlib import Path
from functools import lru_cache
from importlib.metadata import version
from threading import Lock

import swisseph as swe

from .models import BirthProfile

SIGNS = ("Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces")
NAKSHATRAS = ("Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati")
DASHA = (("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10), ("Mars", 7), ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17))
PLANETS = {"Sun": swe.SUN, "Moon": swe.MOON, "Mercury": swe.MERCURY, "Venus": swe.VENUS, "Mars": swe.MARS, "Jupiter": swe.JUPITER, "Saturn": swe.SATURN, "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE, "Pluto": swe.PLUTO}
AYANAMSA = {"lahiri": swe.SIDM_LAHIRI, "raman": swe.SIDM_RAMAN, "krishnamurti": swe.SIDM_KRISHNAMURTI}
HOUSE_CODES = {"placidus": b"P", "whole_sign": b"W", "equal": b"E"}
_swe_lock = Lock()  # set_sid_mode changes process-global Swiss Ephemeris state.
ASPECTS = (("conjunction", 0, 8), ("sextile", 60, 5), ("square", 90, 6), ("trine", 120, 6), ("opposition", 180, 8))
EPHE_HASHES = {
    "sepl_18.se1": "ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66",
    "semo_18.se1": "1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7",
}
EPHE_DIR = Path(__file__).resolve().parent.parent / "data" / "ephe"


@lru_cache(maxsize=1)
def verified_ephemeris_path() -> str:
    path = Path(os.getenv("SWEPH_EPHE_PATH", str(EPHE_DIR))).resolve()
    for name, digest in EPHE_HASHES.items():
        data = path / name
        if not data.is_file() or hashlib.sha256(data.read_bytes()).hexdigest() != digest:
            raise ValueError(f"Pinned ephemeris file missing or changed: {name}")
    return str(path)


def zodiac(longitude: float) -> dict:
    angle = longitude % 360
    return {"sign": SIGNS[int(angle // 30)], "degree": round(angle % 30, 6), "longitude": round(angle, 6)}


def nakshatra(longitude: float) -> dict:
    angle = longitude % 360
    span = 360 / 27
    index = min(26, floor(angle / span))
    offset = angle - index * span
    return {"name": NAKSHATRAS[index], "index": index, "pada": min(4, floor(offset / (span / 4)) + 1), "fraction_elapsed": offset / span, "ruler": DASHA[index % 9][0]}


def mahadashas(moon_longitude: float, birth_utc: datetime, count: int = 10) -> list[dict]:
    star = nakshatra(moon_longitude)
    first = star["index"] % 9
    year_days = 365.25
    start = birth_utc - timedelta(days=DASHA[first][1] * year_days * star["fraction_elapsed"])
    periods = []
    for offset in range(count):
        ruler, years = DASHA[(first + offset) % 9]
        end = start + timedelta(days=years * year_days)
        periods.append({"ruler": ruler, "start_utc": start.isoformat(), "end_utc": end.isoformat(), "current_at_birth": start <= birth_utc < end})
        start = end
    return periods


def _planet(jd: float, body: int, flags: int) -> tuple[dict, int]:
    result = swe.calc_ut(jd, body, flags)
    values, returned_flags = result[:2]
    return {**zodiac(values[0]), "speed_longitude": round(values[3], 8), "retrograde": values[3] < 0}, returned_flags


def _houses(jd: float, profile: BirthProfile, sidereal: bool) -> tuple[dict | None, str | None]:
    system = b"W" if sidereal else HOUSE_CODES[profile.western_houses]
    flags = swe.FLG_SIDEREAL if sidereal else 0
    try:
        cusps, angles = swe.houses_ex(jd, profile.latitude, profile.longitude, system, flags)
    except swe.Error as exc:
        return None, f"House calculation unavailable: {exc}"
    cusp_values = cusps[1:13] if len(cusps) == 13 else cusps[:12]
    return {"cusps": [zodiac(c) for c in cusp_values], "ascendant": zodiac(angles[0]), "midheaven": zodiac(angles[1])}, None


def _aspects(positions: dict) -> list[dict]:
    names = list(PLANETS)
    results = []
    for i, first in enumerate(names):
        for second in names[i + 1:]:
            separation = abs(positions[first]["longitude"] - positions[second]["longitude"])
            separation = min(separation, 360 - separation)
            for name, target, orb_limit in ASPECTS:
                orb = abs(separation - target)
                if orb <= orb_limit:
                    results.append({"first": first, "second": second, "aspect": name, "orb": round(orb, 4), "separation": round(separation, 4)})
                    break
    return results


def calculate(profile: BirthProfile, birth_utc: datetime, warnings: list[str]) -> dict:
    with _swe_lock:
        return _calculate_locked(profile, birth_utc, warnings)


def _calculate_locked(profile: BirthProfile, birth_utc: datetime, warnings: list[str]) -> dict:
    from .derived import antardashas, divisional_chart, element_distribution, whole_sign_houses
    if not 1800 <= birth_utc.year <= 2399:
        raise ValueError("Pinned ephemeris supports 1800–2399 only")
    swe.set_ephe_path(verified_ephemeris_path())
    hour = birth_utc.hour + birth_utc.minute / 60 + birth_utc.second / 3600 + birth_utc.microsecond / 3_600_000_000
    jd = swe.julday(birth_utc.year, birth_utc.month, birth_utc.day, hour)
    node = swe.TRUE_NODE if profile.node_mode == "true" else swe.MEAN_NODE
    base_flags = swe.FLG_SWIEPH | swe.FLG_SPEED

    def lens(sidereal: bool) -> dict:
        if sidereal:
            swe.set_sid_mode(AYANAMSA[profile.ayanamsa])
        flags = base_flags | (swe.FLG_SIDEREAL if sidereal else 0)
        positions = {}
        returned = {}
        bodies = PLANETS if not sidereal else {k: v for k, v in PLANETS.items() if k not in ("Uranus", "Neptune", "Pluto")}
        for name, body in {**bodies, "Rahu": node}.items():
            positions[name], returned[name] = _planet(jd, body, flags)
        if any(not value & swe.FLG_SWIEPH for value in returned.values()):
            raise ValueError("Swiss Ephemeris did not use the pinned data files")
        positions["Ketu"] = {**zodiac(positions["Rahu"]["longitude"] + 180), "speed_longitude": positions["Rahu"]["speed_longitude"], "retrograde": positions["Rahu"]["retrograde"]}
        houses, house_warning = _houses(jd, profile, sidereal) if profile.time_known else (None, None)
        local_warnings = list(warnings)
        if house_warning:
            local_warnings.append(house_warning)
        result = {
            "zodiac": "sidereal" if sidereal else "tropical",
            "house_system": "whole_sign" if sidereal else profile.western_houses,
            "positions": positions,
            "houses": houses,
            "warnings": local_warnings,
            "metadata": {
                "julian_day_ut": jd,
                "ephemeris_version": swe.version,
                "ephemeris_data": "sepl_18.se1 + semo_18.se1 (SHA-256 pinned)",
                "requested_ephemeris": "Swiss Ephemeris",
                "actual_ephemeris_flags": returned,
                "node_mode": profile.node_mode,
                "ayanamsa": profile.ayanamsa if sidereal else None,
                "ayanamsa_degrees": round(swe.get_ayanamsa_ut(jd), 8) if sidereal else None,
                "geocentric": True,
                "birth_utc": birth_utc.isoformat(),
                "birth_timezone": profile.timezone,
                "tzdata_package_version": version("tzdata"),
                "birth_time_known": profile.time_known,
            },
        }
        if sidereal:
            result["moon_nakshatra"] = nakshatra(positions["Moon"]["longitude"])
            result["mahadashas"] = mahadashas(positions["Moon"]["longitude"], birth_utc) if profile.time_known else None
            result["whole_sign_placements"] = whole_sign_houses(positions, houses["ascendant"] if houses else None)
            result["divisional"] = {"D9": divisional_chart(positions, houses["ascendant"] if houses else None, 9), "D10": divisional_chart(positions, houses["ascendant"] if houses else None, 10)}
            result["antardashas"] = [antardashas(period) for period in result["mahadashas"]] if result["mahadashas"] else None
        else:
            result["aspects"] = _aspects(positions)
            result["elements"] = element_distribution(positions)
        return result

    return {"birth_profile": profile.model_dump(mode="json"), "western": lens(False), "vedic": lens(True)}
