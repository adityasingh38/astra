# ASTRA

An AGPL-3.0-or-later, calculation-first Expo + FastAPI implementation of one birth profile viewed through Western and Vedic lenses.

## Status

Implemented in source: Supabase email/password sign-in and session restore; authenticated, row-scoped birth-profile CRUD, selection, export and account deletion; explicit birthplace search with OpenStreetMap Nominatim and coordinate-to-IANA timezone lookup; historical timezone validation; pinned Swiss Ephemeris data and server-side Western/Vedic natal charts; D9/D10 sign mapping, whole-sign placements, Mahadasha/Antardasha periods; calculated transit snapshots and two-profile comparisons; and readings assembled entirely from ASTRA's authored passage catalog.

Birthplace coordinates and timezone can be selected from search results or entered manually. Public Nominatim is for low-volume development only. A birth profile is persisted in Supabase; chart results are recalculated when opened and saved once per profile fingerprint and calculation version. Today shows a noon local-time transit snapshot, not an all-day forecast. Connections shows calculated aspects and Vedic placements without a compatibility score.

Independent JPL Horizons reference points for Sun, Moon, and Mars are in `tests/test_engine.py`; see `docs/VERIFICATION.md` for the query and limits. Still needed before public release: signed-in Supabase integration tests, editorial review of the passage catalog, multi-instance rate limiting, device accessibility review, production geocoder and deployment configuration, and broader chart references. Credentials belong in ignored local `.env` files; a fresh checkout has no live service access until they are configured.

## Layout

- `apps/mobile` — Expo Router app with shared birth profile and chart views.
- `services/api` — FastAPI contracts, timezone conversion, and calculation modules.
- `db` — Supabase PostgreSQL tables and row level security policies.
- `docs` — architecture, calculation conventions, risks, and milestones.

## Local setup

Requires Python 3.11+, Node 20+, npm, and a Supabase project. No AI key or model installation is needed for readings. Run `db/001_initial.sql`, `db/002_snapshot_fingerprint.sql`, and `db/003_delete_account.sql` in order in your Supabase SQL editor, then set the same project URL and publishable key in both `.env` files. From `services/api`:

```sh
python -m venv .venv
# activate the venv for your shell
python -m pip install -r requirements.txt
cp .env.example .env
# Set Supabase credentials and a contact-bearing GEOCODING_USER_AGENT.
# Bundled, SHA-256-checked Swiss Ephemeris files cover 1800–2399.
uvicorn app.main:app --env-file .env --reload
python -m pytest
```

On Windows the dependency file installs `pysweph`, which has the same `swisseph` import name; Linux uses `pyswisseph`. The bundled ephemeris data hashes are checked before calculation. The API rejects any fallback from Swiss Ephemeris files.

From `apps/mobile`:

```sh
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL and Supabase URL/publishable key.
# Use your LAN IP for the API when running on a phone.
npx expo start
```

For layout review without a Supabase account, open `http://localhost:8081/preview` while Expo is running in development mode. The preview route is disabled in production builds. Its fictional Greenwich chart was computed locally for UI inspection, uses an unverified ephemeris fallback, and cannot produce a verified reading.

The welcome starfield and chart orbit in `apps/mobile/src/sky-components.tsx` are original React Native adaptations inspired by Forever Components' [Twinkling Starfield](https://forevercomponents.com/components/cosmic-space/twinkling-starfield/) and [Orbiting Planet System](https://forevercomponents.com/components/cosmic-space/orbiting-planet-system/). The chart orbit plots calculated planetary longitudes for the selected Western or Vedic lens. No Forever HTML/CSS/JS source is bundled.

The API listens on localhost by default; use `uvicorn app.main:app --env-file .env --host 0.0.0.0 --reload` for a device on your LAN. Do not put a Supabase service-role key in the mobile app. Profile requests use the signed-in user's access token so Supabase row level security applies.

Every Explore reading is a collection of prewritten passages from `services/api/app/reading_catalog.py`. ASTRA selects passages using calculated Western or Vedic placements, returns catalog IDs, and shows the supporting chart facts. No reading calls an AI service or invents prose. The local rate limiter covers reading and place-search requests, but a shared store is required for multiple API instances. `/health` checks liveness and `/ready` checks credentials, bundled data, and production geocoder configuration.

## License and source

ASTRA source is licensed under [AGPL-3.0-or-later](LICENSE). Swiss Ephemeris is dual licensed; this project follows its AGPL path. The bundled `sepl_18.se1` and `semo_18.se1` files came from the [Astrodienst Swiss Ephemeris repository](https://github.com/aloistr/swisseph/tree/master/ephe); hashes and reference calculations are recorded in `docs/VERIFICATION.md`. Keep the complete corresponding source publicly available to users before operating a public network service. This GitHub repository is currently private while the app is under development.

## Example API request

```sh
curl -X POST http://127.0.0.1:8000/charts/dual -H 'Content-Type: application/json' -H 'Authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>' -d '{"name":"Example","birth_date":"2002-06-21","birth_time":"20:20:00","time_known":true,"timezone":"Asia/Kolkata","latitude":9.9312,"longitude":76.2673,"place_label":"Kochi, India"}'
```

The example is a regression **input**, not a claim about its placements. See `docs/ARCHITECTURE.md` before interpreting chart results or distributing the service.
