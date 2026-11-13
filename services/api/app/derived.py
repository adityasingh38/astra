from datetime import datetime
from math import floor

from .engine import DASHA, SIGNS


def divisional_sign(longitude: float, division: int) -> dict:
    """Parashari D9/D10 mapping, from exact sidereal longitude."""
    if division not in (9, 10):
        raise ValueError("Only D9 and D10 mapping is implemented")
    value = longitude % 360
    natal_sign = floor(value / 30)
    segment = min(division - 1, floor((value % 30) / (30 / division)))
    if division == 9:
        # Movable: same; fixed: ninth; dual: fifth sign.
        start = (natal_sign + (0, 8, 4)[natal_sign % 3]) % 12
    else:
        # Odd zodiac signs start with themselves; even signs start ninth.
        start = (natal_sign + (0 if natal_sign % 2 == 0 else 8)) % 12
    sign = (start + segment) % 12
    return {"sign": SIGNS[sign], "sign_index": sign, "segment": segment + 1}


def divisional_chart(positions: dict, ascendant: dict | None, division: int) -> dict:
    result = {name: divisional_sign(item["longitude"], division) for name, item in positions.items()}
    return {"division": division, "positions": result, "ascendant": divisional_sign(ascendant["longitude"], division) if ascendant else None, "mapping": "Parashari odd/even D10" if division == 10 else "Parashari movable/fixed/dual D9", "birth_time_warning": "Divisional ascendants are sensitive to exact birth time."}


def antardashas(mahadasha: dict) -> list[dict]:
    ruler = mahadasha["ruler"]
    first = next(i for i, item in enumerate(DASHA) if item[0] == ruler)
    start = datetime.fromisoformat(mahadasha["start_utc"])
    end = datetime.fromisoformat(mahadasha["end_utc"])
    total = end - start
    parts = []
    for offset in range(9):
        subruler, years = DASHA[(first + offset) % 9]
        next_start = end if offset == 8 else start + total * (years / 120)
        parts.append({"mahadasha": ruler, "antardasha": subruler, "start_utc": start.isoformat(), "end_utc": next_start.isoformat()})
        start = next_start
    return parts


def whole_sign_houses(positions: dict, ascendant: dict | None) -> dict | None:
    if not ascendant:
        return None
    first = SIGNS.index(ascendant["sign"])
    return {name: (SIGNS.index(item["sign"]) - first) % 12 + 1 for name, item in positions.items()}


def element_distribution(positions: dict) -> dict:
    counts = {"fire": 0, "earth": 0, "air": 0, "water": 0}
    elements = ("fire", "earth", "air", "water")
    for name, item in positions.items():
        if name in ("Rahu", "Ketu"):
            continue
        counts[elements[SIGNS.index(item["sign"]) % 4]] += 1
    return counts
