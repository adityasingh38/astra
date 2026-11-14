# Building ASTRA

## Web

From `apps/mobile`, run `npm ci`, `npm run typecheck`, and `npx expo export --platform web`. The static build is written to `dist/`. Serve it with a static server that falls back to `index.html` for app routes.

Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_API_URL` before exporting. These values are embedded in the client bundle. The FastAPI service and Supabase project must remain reachable at runtime; the web bundle alone does not run chart calculations.

## Android preview

`apps/mobile/eas.json` has a `preview` profile for an installable APK and a `production` profile for an Android App Bundle. After signing in to Expo and linking an EAS project, run `npx eas-cli@latest build --platform android --profile preview` from `apps/mobile`.

Before making an APK for a phone, provide a reachable HTTPS FastAPI URL as `EXPO_PUBLIC_API_URL` in the build environment. `http://127.0.0.1:8000` refers to the phone itself and will not reach a computer running the API. Provide the Supabase URL and publishable key to the build environment as well. Keep server-only secrets out of the mobile build.

The local Windows environment currently has no Android SDK or Java installation. Expo's cloud build can produce the APK without those local tools, but requires an Expo account and available build quota.

## Free API preview hosting

The root `render.yaml` prepares a single free Render web service for the FastAPI backend. It prompts for the existing Supabase URL, publishable key, and a contact-bearing geocoding user agent; no credential value is committed. This is a low-volume preview setup, not production hosting. Render's free service can sleep when idle, so the first chart request after inactivity can be slow. Set `EXPO_PUBLIC_API_URL` to its HTTPS service URL when building an APK. Hosted web origins can be added with `ASTRA_ALLOWED_ORIGINS`.

The ASTRA preview API is deployed at `https://astra-api-preview.onrender.com`. Its `/health` and `/ready` endpoints were verified after deployment. The EAS `preview` environment contains this URL and the public Supabase client configuration.
