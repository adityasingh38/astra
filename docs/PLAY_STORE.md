# ASTRA Android release

## Prepared assets and URLs

- Android package: `com.adityasingh38.astra`
- Build profile: `apps/mobile/eas.json` production, Android App Bundle
- Privacy policy: https://adityasingh38.github.io/astra/privacy.html
- External account deletion: https://adityasingh38.github.io/astra/delete-account.html
- Support: hello@trysurge.in
- License and source: https://github.com/adityasingh38/astra (AGPL-3.0-or-later)
- Store screenshots: `../../astra-play-store-phone-screenshots.zip` (8 framed 1080 × 1920 PNGs); an unframed set is in `../../astra-play-store-screenshots.zip`.
- Store icon: `../../astra-play-store-icon.png` (512 × 512 PNG).
- Feature graphic: `../../astra-play-store-feature-graphic.png` (1024 × 500 PNG).

## Suggested store copy

**Short description:** Your birth chart through Western and Vedic astrology.

**Full description:** ASTRA uses one birth profile to calculate Western and Vedic charts. Explore your placements, relationships, transits, and Moolank through written readings selected from the chart facts. Learn the signs, houses, planets, and chart terms in the field guide. Save profiles, export your data, or delete your account in the app.

Readings are for reflection and education. They are not professional advice or factual predictions. Birth time and birthplace accuracy affect chart results.

## Console answers to review

- App requires an account for saved charts and readings. Provide Google review with access instructions and a test account if the review form requests one.
- Data handled: email address, authentication credentials handled by Supabase Auth, birth profile name/date/time/place/coordinates/time zone, calculated chart data. Birthplace search words go to OpenStreetMap Nominatim through the API.
- Data is transmitted over HTTPS. Users can export their saved data and delete a profile or account in the app; external account deletion is at the URL above.
- ASTRA uses Supabase and Render as service providers and OpenStreetMap Nominatim for place lookup. Review the Play Data safety definitions and answer based on the release build and provider agreements.
- No advertising SDK, generative AI reading service, or payment integration is in the current app.

## Remaining human checks

1. Install the release candidate on a physical Android device and verify sign-up, email confirmation, birthplace search, chart calculation, reading navigation, data export, and deletion, including accessibility and slow-start behavior.
2. Complete Play Console identity/payment setup, store listing, content rating, Data safety, app access, and the privacy and deletion URLs. Upload the AAB and screenshots.
3. Complete any closed testing requirement Play Console applies to the developer account before production access.
