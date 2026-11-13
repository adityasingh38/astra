# Architecture and delivery plan

## Product model

One `BirthProfile` is the source of date, civil time, place, coordinates and timezone. `POST /charts/dual` resolves it once to UTC, then calculates two independent lenses. Each lens carries its own zodiac, house, node, and ayanamsa settings. UI readings must cite the facts in that lens. No LLM determines astronomical or astrological facts.

## Data flow

`authenticated birth input → geocoding/timezone validation → row-scoped profile storage → UTC Julian Day → Swiss Ephemeris → Western/Vedic chart facts → deterministic rules → constrained interpretation → fact validation → UI`

The server returns both a shared `birth_profile` and separate `western` and `vedic` results. Time unknown uses noon UTC only as a **planet-position reference** for that calendar day; it suppresses ascendant, houses, and dashas and marks Moon/nakshatra as time-sensitive. This is not an inferred birth time.

## Calculation conventions in this milestone

- Geocentric ecliptic longitudes and speeds from Swiss Ephemeris `calc_ut` with `FLG_SWIEPH | FLG_SPEED`; bundled data files are SHA-256 checked, and calculations reject fallback. The bundled files cover 1800–2399.
- Western: tropical, Placidus by default, true lunar node by default. Whole Sign and Equal alternatives. Placidus polar failure returns unavailable houses and an explanatory warning.
- Vedic: sidereal `FLG_SIDEREAL`, Lahiri by default; Raman and Krishnamurti selectable. Whole Sign houses. Nine traditional grahas are shown. Sidereal houses use the same sidereal ascendant reference as the Vedic positions.
- Rahu is true node by default; Ketu is exactly 180° opposite. Mean node is configurable.
- Nakshatras divide 360° into 27 equal sectors; padas subdivide each into four. Exact sidereal lunar longitude determines the sector.
- Vimshottari uses 365.25 ephemeris days per dasha year, with each period length proportional to its planetary year allocation. Birth balance is the remaining fraction of the Moon's nakshatra. Dates are UTC instants. This is one documented convention, not a universal calendar convention.
- Western aspects cover conjunction, sextile, square, trine and opposition using configurable default orbs (8°, 5°, 6°, 6°, 8°). These are symbolic astrology rules, not astronomical events.
- D9 maps 3°20′ segments: movable signs start with themselves, fixed signs at the ninth, and dual signs at the fifth. D10 maps 3° segments: odd signs start with themselves and even signs at the ninth. The API reports the mapping and suppresses divisional ascendants without a birth time.
- Antardashas subdivide each Mahadasha in the standard planetary order, proportional to each ruler's years out of 120, using the same 365.25-day convention.
- AI readings receive a small allowlist of fact IDs from one lens and topic. The model returns structured sentences citing those IDs; validation rejects unknown citations or chart labels in narrative text. Exact placements are rendered from calculation facts, not model prose.
- AI readings are unavailable if the engine cannot use the pinned data. Moon-dependent reading facts are withheld when birth time is unknown.
- Today samples current planetary positions at 12:00 UTC and reports major aspects within 2° of natal planets; it is a snapshot rather than a forecast for the whole day.
- Connections compares major Western aspects within 5° and shows Vedic Moon nakshatra/sign and D9 Venus sign. There is no compatibility score; Moon comparisons are withheld if either birth time is unknown.

## Risks and release gates

1. **License:** ASTRA is AGPL-3.0-or-later, following the Swiss Ephemeris AGPL path. Make complete source available before public network operation. Source: https://www.astro.com/swisseph/swisseph.htm
2. **Ephemeris accuracy:** pinned data, returned flags and one independent JPL reference are tested. Broader references for houses, sidereal conventions and date boundaries remain.
3. **Timezones:** historical IANA rules can change with tzdata updates. Persist timezone ID, input local time, fold choice, UTC result, and tzdata version. Ambiguous times require an explicit fold; nonexistent times are rejected.
4. **Vedic conventions:** ayanamsa, node mode, divisional mapping, dasha year and Koota rules vary. Store each selection and cite the adopted ruleset.
5. **AI claims:** the implemented validator rejects unsupported IDs and placement labels, but generated interpretation quality and factual grounding still require adversarial evaluation before release.
6. **Privacy:** profile and snapshot rows have Supabase RLS; the app offers export, profile deletion and account deletion. Account deletion and RLS require live verification with user credentials before release.
7. **Geocoding:** the public Nominatim endpoint limits use to at most one request per second per application and requires attribution and an identifying contact. The server serializes requests and caches searches. Production requires a configured hosted Nominatim-compatible endpoint.
8. **Operations:** the in-memory per-token rate limiter handles one instance only. Deploy a shared limiter before scaling. `/ready` checks required configuration; request logs omit tokens, queries and birth data.

## Testable milestones

1. **Foundation:** project setup, onboarding, auth and row-scoped profile API implemented in source; live Supabase integration remains untested without project credentials.
2. **Calculation core:** both lenses, houses, nakshatra and initial dasha from one UTC instant; unit tests pass.
3. **Verified chart:** pinned ephemeris data and an independent Kochi 2002-06-21 20:20 IST reference for three bodies are tested; further references remain a release gate.
4. **Interpretation:** fact IDs and validated structured prose implemented; live model calls and adversarial evaluation remain.
5. **Relationships and release:** basic synastry and descriptive Vedic placements are implemented; Koota rules, live storage validation, device accessibility and deployment remain.

## MVP acceptance criteria

- A user enters one name, date, exact or unknown time, city label, coordinates and IANA timezone.
- The API either returns a reproducible UTC instant plus separate Western/Vedic chart facts or a specific validation error.
- Time-dependent results disappear for unknown time; DST gaps and unresolved ambiguous times are not guessed.
- The app shows both lenses from the same profile, provides calculation metadata, and does not present illustrative prose as a calculated reading.
- Automated tests cover timezone folds/gaps, sidereal/tropical separation, nakshatra boundaries, dasha balance, and missing time.
- Public release waits for live integration, broader fixtures, security and device checks, and source availability.
