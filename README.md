# ASTRA

An early, calculation-first Expo + FastAPI implementation of one birth profile viewed through Western and Vedic lenses.

## Status

Implemented in source: Supabase email/password sign-in and session restore; authenticated, row-scoped birth-profile CRUD; explicit birthplace search with OpenStreetMap Nominatim and coordinate-to-IANA timezone lookup; historical timezone validation; server-side Western and Vedic natal charts; D9/D10 sign mapping, whole-sign placements, and Mahadasha/Antardasha periods; and fact-cited AI readings through the OpenAI Responses API. The Expo app displays saved profiles, both chart lenses, deeper Vedic data, and reading evidence.

Birthplace coordinates and timezone can be selected from search results or entered manually. Public Nominatim is for low-volume development only; configure an appropriate provider before scaling. A birth profile is persisted in Supabase, while chart results are recalculated when opened. The `chart_snapshots` table is prepared but not yet populated.

Not yet implemented: independently verified golden-chart fixtures, D2/D3 and other divisions, nested dasha levels beyond Antardasha, compatibility, transit readings, journal, subscriptions, production rate limits, and deployment. Supabase and OpenAI integrations require your project credentials and have not been exercised against live accounts here. This is **not** a complete or verified commercial astrology app.

## Layout

- `apps/mobile` — Expo Router app with shared birth profile and chart views.
- `services/api` — FastAPI contracts, timezone conversion, and calculation modules.
- `db` — Supabase PostgreSQL tables and row level security policies.
- `docs` — architecture, calculation conventions, risks, and milestones.

## Local setup

Requires Python 3.11+, Node 20+, npm, a Supabase project, and an OpenAI API key for AI readings. Run `db/001_initial.sql` in your Supabase SQL editor, then set the same project URL and publishable key in both `.env` files. From `services/api`:

```sh
python -m venv .venv
# activate the venv for your shell
python -m pip install -r requirements.txt
cp .env.example .env
# Set Supabase credentials, a contact-bearing GEOCODING_USER_AGENT,
# and OPENAI_API_KEY (server side only).
# Set SWEPH_EPHE_PATH to pinned Swiss Ephemeris data files.
uvicorn app.main:app --env-file .env --reload
python -m pytest
```

On Windows the dependency file installs `pysweph`, a maintained binding with the same `swisseph` import name, because current `pyswisseph` source distributions require a local C++ compiler. The calculation adapter accepts either binding's `calc_ut` response shape. Pin the binding and ephemeris data for production.

From `apps/mobile`:

```sh
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL and Supabase URL/publishable key.
# Use your LAN IP for the API when running on a phone.
npx expo start
```

For layout review without a Supabase account, open `http://localhost:8081/preview` while Expo is running in development mode. The preview route is disabled in production builds. Its fictional Greenwich chart was computed locally for UI inspection, uses an unverified ephemeris fallback, and cannot generate AI readings.

The welcome starfield and chart orbit in `apps/mobile/src/sky-components.tsx` are original React Native adaptations inspired by Forever Components' [Twinkling Starfield](https://forevercomponents.com/components/cosmic-space/twinkling-starfield/) and [Orbiting Planet System](https://forevercomponents.com/components/cosmic-space/orbiting-planet-system/). The chart orbit plots calculated planetary longitudes for the selected Western or Vedic lens. No Forever HTML/CSS/JS source is bundled.

The API listens on localhost by default; use `uvicorn app.main:app --env-file .env --host 0.0.0.0 --reload` for a device on your LAN. Do not put the OpenAI key or a Supabase service-role key in the mobile app. Profile requests use the signed-in user's access token so Supabase row level security applies.

AI readings reject charts that fall back to Moshier calculations. They also reject model sentences that introduce chart labels rather than citing a calculated fact card. This is a narrow guard, not a substitute for independent ephemeris fixtures and adversarial reading tests.

## Example API request

```sh
curl -X POST http://127.0.0.1:8000/charts/dual -H 'Content-Type: application/json' -H 'Authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>' -d '{"name":"Example","birth_date":"2002-06-21","birth_time":"20:20:00","time_known":true,"timezone":"Asia/Kolkata","latitude":9.9312,"longitude":76.2673,"place_label":"Kochi, India"}'
```

The example is a regression **input**, not a claim about its placements. See `docs/ARCHITECTURE.md` before interpreting chart results or distributing the service.
