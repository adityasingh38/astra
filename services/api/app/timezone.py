from datetime import datetime, time, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .models import BirthProfile


class BirthTimeError(ValueError):
    pass


def resolve_utc(profile: BirthProfile) -> tuple[datetime, list[str]]:
    try:
        zone = ZoneInfo(profile.timezone)
    except ZoneInfoNotFoundError as exc:
        raise BirthTimeError("Unknown IANA timezone") from exc

    if not profile.time_known:
        # Noon is a reference instant for positions only; it is not the birth time.
        reference = datetime.combine(profile.birth_date, time(12), zone).astimezone(timezone.utc)
        return reference, ["Birth time unknown: positions are a local-noon reference; Moon and other fast-moving positions may differ. Ascendant, houses and dashas are unavailable."]

    local = datetime.combine(profile.birth_date, profile.birth_time)
    choices = []
    for fold in (0, 1):
        candidate = local.replace(tzinfo=zone, fold=fold)
        utc = candidate.astimezone(timezone.utc)
        if utc.astimezone(zone).replace(tzinfo=None) == local:
            choices.append(utc)
    if not choices:
        raise BirthTimeError("Local birth time does not exist in this timezone (DST gap)")
    if choices[0] != choices[-1] and profile.fold is None:
        raise BirthTimeError("Local birth time is ambiguous; choose fold 0 (earlier) or 1 (later)")
    return choices[profile.fold or 0], []
