import json
import os
import re

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, Field

from .engine import NAKSHATRAS, PLANETS, SIGNS


class ReadingRequest(BaseModel):
    lens: str = Field(pattern="^(western|vedic)$")
    topic: str = Field(pattern="^(identity|love|career)$")


class Sentence(BaseModel):
    text: str = Field(min_length=10, max_length=400)
    fact_ids: list[str] = Field(min_length=1, max_length=4)


class Reading(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    sentences: list[Sentence] = Field(min_length=2, max_length=6)


def facts_for(chart: dict, lens: str, topic: str) -> dict[str, str]:
    selected = chart[lens]
    positions = selected["positions"]
    names = {"identity": ("Sun", "Moon", "Mercury"), "love": ("Venus", "Mars", "Moon"), "career": ("Sun", "Saturn", "Jupiter")}[topic]
    if not chart["birth_profile"]["time_known"]:
        names = tuple(name for name in names if name != "Moon")
    facts = {f"{lens}.{name.lower()}": f"{name} at {position['degree']:.2f}° {position['sign']} ({selected['zodiac']})" for name in names if (position := positions.get(name))}
    if selected["houses"] and chart["birth_profile"]["time_known"]:
        facts[f"{lens}.ascendant"] = f"Ascendant at {selected['houses']['ascendant']['degree']:.2f}° {selected['houses']['ascendant']['sign']}"
    if lens == "vedic":
        if chart["birth_profile"]["time_known"]:
            star = selected["moon_nakshatra"]
            facts["vedic.nakshatra"] = f"Moon nakshatra {star['name']}, pada {star['pada']}"
    else:
        for index, aspect in enumerate(selected["aspects"]):
            if aspect["first"] in names and aspect["second"] in names:
                facts[f"western.aspect.{index}"] = f"{aspect['first']} {aspect['aspect']} {aspect['second']}, orb {aspect['orb']:.2f}°"
    return facts


_placement_words = re.compile(r"\b(?:" + "|".join([*PLANETS, "Rahu", "Ketu", *SIGNS, *NAKSHATRAS, "ascendant", "rising", "lagna", "house", "nakshatra"]) + r")\b|\b\d+(?:\.\d+)?\s*(?:°|degrees|th house)\b", re.IGNORECASE)


def validate_reading(payload: dict, facts: dict[str, str]) -> Reading:
    reading = Reading.model_validate(payload)
    if _placement_words.search(reading.title):
        raise ValueError("Reading title contains a chart label outside cited fact cards")
    for sentence in reading.sentences:
        if any(fact_id not in facts for fact_id in sentence.fact_ids):
            raise ValueError("Reading cites an unknown fact")
        if _placement_words.search(sentence.text):
            raise ValueError("Reading contains a chart label outside cited fact cards")
    return reading


async def generate_reading(chart: dict, request: ReadingRequest) -> dict:
    if any("fallback" in warning.lower() for warning in chart[request.lens]["warnings"]):
        raise HTTPException(422, "AI reading requires a chart calculated with pinned Swiss Ephemeris data files")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(503, "AI readings are not configured")
    facts = facts_for(chart, request.lens, request.topic)
    if not facts:
        raise HTTPException(422, "No supported facts for this topic")
    schema = {"type": "object", "properties": {"title": {"type": "string"}, "sentences": {"type": "array", "items": {"type": "object", "properties": {"text": {"type": "string"}, "fact_ids": {"type": "array", "items": {"type": "string"}}}, "required": ["text", "fact_ids"], "additionalProperties": False}}}, "required": ["title", "sentences"], "additionalProperties": False}
    body = {"model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"), "store": False, "instructions": "Write short reflective astrology prose using ONLY the supplied traditional chart facts. Every sentence must cite one or more exact fact IDs. Do not mention any planet, zodiac sign, nakshatra, degree, house number, date, event prediction, diagnosis, or certainty in narrative text; the UI separately displays exact cited facts. Do not claim astrology predicts outcomes. Return only the requested JSON schema.", "input": json.dumps({"lens": request.lens, "topic": request.topic, "facts": facts}), "text": {"format": {"type": "json_schema", "name": "astra_reading", "strict": True, "schema": schema}}}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post("https://api.openai.com/v1/responses", headers={"Authorization": f"Bearer {api_key}"}, json=body)
            response.raise_for_status()
        output = response.json()
        if output.get("status") != "completed":
            raise ValueError("AI response incomplete")
        text = next(item["text"] for block in output["output"] for item in block.get("content", []) if item.get("type") == "output_text")
        reading = validate_reading(json.loads(text), facts)
    except (httpx.HTTPError, KeyError, StopIteration, ValueError) as exc:
        raise HTTPException(502, "AI reading could not be validated") from exc
    return {"reading": reading.model_dump(), "facts": facts, "lens": request.lens, "topic": request.topic, "calculation_metadata": chart[request.lens]["metadata"]}
