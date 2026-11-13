from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class BirthProfile(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    birth_date: date
    birth_time: time | None = None
    time_known: bool = True
    timezone: str = Field(min_length=3, max_length=80)
    fold: Literal[0, 1] | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    place_label: str = Field(min_length=1, max_length=160)
    western_houses: Literal["placidus", "whole_sign", "equal"] = "placidus"
    ayanamsa: Literal["lahiri", "raman", "krishnamurti"] = "lahiri"
    node_mode: Literal["true", "mean"] = "true"

    @model_validator(mode="after")
    def validate_time(self):
        if not 1800 <= self.birth_date.year <= 2399:
            raise ValueError("Bundled ephemeris supports birth years 1800–2399")
        if self.time_known and self.birth_time is None:
            raise ValueError("birth_time is required when time_known is true")
        if not self.time_known and self.birth_time is not None:
            raise ValueError("omit birth_time when time_known is false")
        return self
