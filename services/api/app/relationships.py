"""Transparent comparisons of calculated positions; no compatibility score."""
from datetime import date, datetime, time, timezone
from zoneinfo import ZoneInfo

from .engine import ASPECTS, calculate
from .models import BirthProfile
from .timezone import resolve_utc


def cross_aspects(first: dict, second: dict, *, orb_cap: float = 5) -> list[dict]:
    results = []
    for first_name, first_position in first.items():
        for second_name, second_position in second.items():
            separation = abs(first_position["longitude"] - second_position["longitude"])
            separation = min(separation, 360 - separation)
            for name, target, standard_orb in ASPECTS:
                orb = abs(separation - target)
                if orb <= min(orb_cap, standard_orb):
                    results.append({"first": first_name, "second": second_name, "aspect": name, "orb": round(orb, 3)})
                    break
    return sorted(results, key=lambda item: item["orb"])


def compatibility(first: dict, second: dict) -> dict:
    a, b = first["birth_profile"], second["birth_profile"]
    western_names = ("Sun", "Moon", "Mercury", "Venus", "Mars") if a["time_known"] and b["time_known"] else ("Sun", "Mercury", "Venus", "Mars")
    western = cross_aspects({k: first["western"]["positions"][k] for k in western_names}, {k: second["western"]["positions"][k] for k in western_names})
    vedic = {"moon_nakshatras": [first["vedic"]["moon_nakshatra"], second["vedic"]["moon_nakshatra"]] if a["time_known"] and b["time_known"] else None,
             "moon_signs": [first["vedic"]["positions"]["Moon"]["sign"], second["vedic"]["positions"]["Moon"]["sign"]] if a["time_known"] and b["time_known"] else None,
             "d9_venus_signs": [first["vedic"]["divisional"]["D9"]["positions"]["Venus"]["sign"], second["vedic"]["divisional"]["D9"]["positions"]["Venus"]["sign"]]}
    return {"profiles": [a["name"], b["name"]], "western": {"synastry_aspects": western}, "vedic": vedic,
            "method": "Geocentric natal longitudes; major Western aspects with a 5° maximum orb. Vedic values are descriptive placements, not a score.",
            "warnings": [] if a["time_known"] and b["time_known"] else ["Moon compatibility omitted because at least one birth time is unknown."]}


def transits(profile: BirthProfile, natal: dict, day: date) -> dict:
    if not 1800 <= day.year <= 2399:
        raise ValueError("Pinned ephemeris supports 1800–2399 only")
    at_utc = datetime.combine(day, time(12), tzinfo=ZoneInfo(profile.timezone)).astimezone(timezone.utc)
    sky = calculate(profile, at_utc, [])
    natal_names = ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn") if profile.time_known else ("Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn")
    transit_names = ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn")
    aspects = cross_aspects({k: sky["western"]["positions"][k] for k in transit_names}, {k: natal["western"]["positions"][k] for k in natal_names}, orb_cap=2)
    return {"date_local": day.isoformat(), "timezone": profile.timezone, "sample_time_utc": at_utc.isoformat(), "western": {"positions": sky["western"]["positions"], "natal_aspects": aspects},
            "vedic": {"moon": sky["vedic"]["positions"]["Moon"], "moon_nakshatra": sky["vedic"]["moon_nakshatra"]},
            "method": "Geocentric positions at 12:00 local time; major aspects to natal planets within 2°. Snapshot, not a whole-day forecast.",
            "warnings": [] if profile.time_known else ["Natal Moon omitted because birth time is unknown."]}
