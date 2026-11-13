"""Select authored passages from verified chart facts; no model calls or prose generation."""

from fastapi import HTTPException
from pydantic import BaseModel, Field

from .reading_catalog import (
    ASPECT_PASSAGES, CATALOG_VERSION, D9_PASSAGES, ROLE_PASSAGES,
    SIGN_PASSAGES, TITLES, TOPIC_BODIES, VEDIC_NAMES,
)


class ReadingRequest(BaseModel):
    lens: str = Field(pattern="^(western|vedic)$")
    topic: str = Field(pattern="^(identity|love|career)$")


class ReadingEntry(BaseModel):
    heading: str = Field(min_length=3, max_length=100)
    text: str = Field(min_length=20, max_length=600)
    fact_ids: list[str] = Field(min_length=1, max_length=2)
    passage_ids: list[str] = Field(min_length=1, max_length=2)


class Reading(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    entries: list[ReadingEntry] = Field(min_length=2, max_length=5)


def facts_for(chart: dict, lens: str, topic: str) -> dict[str, str]:
    selected = chart[lens]
    positions = selected["positions"]
    names = TOPIC_BODIES[topic]
    if not chart["birth_profile"]["time_known"]:
        names = tuple(name for name in names if name != "Moon")
    facts = {
        f"{lens}.{name.lower()}": f"{name} at {position['degree']:.2f}° {position['sign']} ({selected['zodiac']})"
        for name in names if (position := positions.get(name))
    }
    if lens == "vedic" and topic == "love" and chart["birth_profile"]["time_known"]:
        d9_venus = selected["divisional"]["D9"]["positions"]["Venus"]
        facts["vedic.d9_venus"] = f"D9 Navamsa Venus in {d9_venus['sign']}"
    if lens == "western":
        for index, aspect in enumerate(selected["aspects"]):
            if aspect["first"] in names and aspect["second"] in names:
                facts[f"western.aspect.{index}"] = f"{aspect['first']} {aspect['aspect']} {aspect['second']}, orb {aspect['orb']:.2f}°"
    return facts


def compose_reading(chart: dict, request: ReadingRequest) -> dict:
    lens, topic = request.lens, request.topic
    if any("fallback" in warning.lower() for warning in chart[lens]["warnings"]):
        raise HTTPException(422, "Reading requires a chart calculated with pinned Swiss Ephemeris files")
    available_facts = facts_for(chart, lens, topic)
    entries = []
    for body in TOPIC_BODIES[topic]:
        fact_id = f"{lens}.{body.lower()}"
        if fact_id not in available_facts:
            continue
        sign = chart[lens]["positions"][body]["sign"]
        heading = f"{VEDIC_NAMES[body]} / {body}" if lens == "vedic" else body
        entries.append(ReadingEntry(
            heading=heading,
            text=f"{ROLE_PASSAGES[lens][topic][body]} {SIGN_PASSAGES[topic][sign]}",
            fact_ids=[fact_id],
            passage_ids=[f"{lens}.{topic}.{body.lower()}", f"sign.{topic}.{sign.lower()}"],
        ))
    if lens == "vedic" and topic == "love" and "vedic.d9_venus" in available_facts:
        sign = chart["vedic"]["divisional"]["D9"]["positions"]["Venus"]["sign"]
        entries.append(ReadingEntry(
            heading="Navamsa / D9 Venus", text=D9_PASSAGES[sign], fact_ids=["vedic.d9_venus"],
            passage_ids=[f"d9.venus.{sign.lower()}"],
        ))
    if lens == "western":
        aspects = [(index, aspect) for index, aspect in enumerate(chart["western"]["aspects"])
                   if f"western.aspect.{index}" in available_facts]
        if aspects:
            index, aspect = min(aspects, key=lambda item: item[1]["orb"])
            entries.append(ReadingEntry(
                heading=f"{aspect['first']} & {aspect['second']}", text=ASPECT_PASSAGES[aspect["aspect"]],
                fact_ids=[f"western.aspect.{index}"], passage_ids=[f"aspect.{aspect['aspect']}"],
            ))
    reading = Reading(title=TITLES[topic], entries=entries)
    cited = {fact_id: available_facts[fact_id] for entry in reading.entries for fact_id in entry.fact_ids}
    return {
        "reading": reading.model_dump(), "facts": cited, "lens": lens, "topic": topic,
        "source": "astra_catalog", "catalog_version": CATALOG_VERSION,
        "calculation_metadata": chart[lens]["metadata"],
    }
