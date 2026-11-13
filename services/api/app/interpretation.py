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


SIGN_QUALITIES = {
    "Aries": "direct action", "Taurus": "steady attention", "Gemini": "curious exchange",
    "Cancer": "protective care", "Leo": "warm expression", "Virgo": "thoughtful details",
    "Libra": "mutual consideration", "Scorpio": "honest depth", "Sagittarius": "room to explore",
    "Capricorn": "dependable commitments", "Aquarius": "independent perspective", "Pisces": "gentle imagination",
}
LOCAL_COPY = {
    "identity": {
        "Sun": "You might recognize yourself through {quality}. Notice when this feels true to you.",
        "Moon": "For emotional steadiness, you may turn toward {quality}. Give that need some room.",
        "Mercury": "In conversation and learning, {quality} may help your thoughts take shape.",
    },
    "love": {
        "Venus": "In closeness, {quality} may feel inviting. Notice how you offer and receive it.",
        "Mars": "When you take initiative, {quality} may shape your approach. Consider how it lands.",
        "Moon": "For emotional ease together, you may appreciate {quality}. Name what helps you feel safe.",
    },
    "career": {
        "Sun": "Work may feel more personal when it allows {quality}. Notice which tasks bring this out.",
        "Saturn": "Steady effort may be easier to sustain through {quality}. Consider one habit that supports it.",
        "Jupiter": "Growth may come from practicing {quality}. Stay curious about what you learn.",
    },
}
VEDIC_LOCAL_COPY = {
    "identity": {
        "Sun": "Consider where {quality} helps you act with purpose. Keep the practice grounded in daily life.",
        "Moon": "Notice how {quality} shapes your inner rhythm. Make space for what steadies you.",
        "Mercury": "Let {quality} inform how you study and speak. Return to what feels clear.",
    },
    "love": {
        "Venus": "Explore {quality} as a way to give care in a relationship. Notice what is returned.",
        "Mars": "When desire moves you, pause and notice {quality}. Choose your next step with care.",
        "Moon": "A sense of ease may grow through {quality}. Notice the rhythm that supports it.",
    },
    "career": {
        "Sun": "Purpose may become clearer when you make space for {quality}. Notice what feels sustainable.",
        "Saturn": "Daily discipline can be explored through {quality}. Try one small repeatable step.",
        "Jupiter": "Learning may open through {quality}. Stay receptive to a different perspective.",
    },
}
LOCAL_TITLES = {"identity": "A way of being", "love": "Ways of connecting", "career": "A path of effort"}


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
            if topic == "love":
                d9_venus = selected["divisional"]["D9"]["positions"]["Venus"]
                facts["vedic.d9_venus"] = f"D9 Navamsa Venus in {d9_venus['sign']}"
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


def local_reading(chart: dict, request: ReadingRequest, facts: dict[str, str]) -> dict:
    positions = chart[request.lens]["positions"]
    sentences = []
    templates = VEDIC_LOCAL_COPY if request.lens == "vedic" else LOCAL_COPY
    for body, template in templates[request.topic].items():
        fact_id = f"{request.lens}.{body.lower()}"
        if fact_id in facts:
            quality = SIGN_QUALITIES[positions[body]["sign"]]
            sentences.append({"text": template.format(quality=quality), "fact_ids": [fact_id]})
    if request.lens == "vedic" and request.topic == "love" and "vedic.d9_venus" in facts:
        sign = chart["vedic"]["divisional"]["D9"]["positions"]["Venus"]["sign"]
        sentences.append({"text": f"This additional relationship lens invites reflection on {SIGN_QUALITIES[sign]}. Return to this question as your experience grows.", "fact_ids": ["vedic.d9_venus"]})
    reading = validate_reading({"title": LOCAL_TITLES[request.topic], "sentences": sentences}, facts)
    return {"reading": reading.model_dump(), "facts": facts, "lens": request.lens, "topic": request.topic,
            "source": "local_editorial", "calculation_metadata": chart[request.lens]["metadata"]}


async def generate_reading(chart: dict, request: ReadingRequest) -> dict:
    if any("fallback" in warning.lower() for warning in chart[request.lens]["warnings"]):
        raise HTTPException(422, "AI reading requires a chart calculated with pinned Swiss Ephemeris data files")
    facts = facts_for(chart, request.lens, request.topic)
    if not facts:
        raise HTTPException(422, "No supported facts for this topic")
    if os.getenv("READING_PROVIDER", "local") != "openai":
        return local_reading(chart, request, facts)
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return local_reading(chart, request, facts)
    schema = {"type": "object", "properties": {"title": {"type": "string"}, "sentences": {"type": "array", "items": {"type": "object", "properties": {"text": {"type": "string"}, "fact_ids": {"type": "array", "items": {"type": "string"}}}, "required": ["text", "fact_ids"], "additionalProperties": False}}}, "required": ["title", "sentences"], "additionalProperties": False}
    body = {"model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"), "store": False, "instructions": "Write short reflective astrology prose using ONLY the supplied traditional chart facts. Every sentence must cite one or more exact fact IDs. Do not mention any planet, zodiac sign, nakshatra, degree, house number, date, event prediction, diagnosis, or certainty in narrative text; the UI separately displays exact cited facts. Do not claim astrology predicts outcomes. Return only the requested JSON schema.", "input": json.dumps({"lens": request.lens, "topic": request.topic, "facts": facts}), "text": {"format": {"type": "json_schema", "name": "astra_reading", "strict": True, "schema": schema}}}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post("https://api.openai.com/v1/responses", headers={"Authorization": f"Bearer {api_key}"}, json=body)
            if response.status_code == 429:
                error = response.json().get("error") or {}
                if error.get("code") in ("credit_balance_exhausted", "insufficient_quota"):
                    return local_reading(chart, request, facts)
                raise HTTPException(429, "OpenAI is rate limiting readings; try again shortly")
            if response.status_code in (401, 403):
                raise HTTPException(503, "OpenAI API key is invalid or lacks access to the selected model")
            response.raise_for_status()
        output = response.json()
        if output.get("status") != "completed":
            raise ValueError("AI response incomplete")
        text = next(item["text"] for block in output["output"] for item in block.get("content", []) if item.get("type") == "output_text")
        reading = validate_reading(json.loads(text), facts)
    except (httpx.HTTPError, KeyError, StopIteration, ValueError) as exc:
        raise HTTPException(502, "AI reading could not be validated") from exc
    return {"reading": reading.model_dump(), "facts": facts, "lens": request.lens, "topic": request.topic, "source": "openai", "calculation_metadata": chart[request.lens]["metadata"]}
