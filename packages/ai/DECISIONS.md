# AI implementation decisions

## A-T12
- WhatsApp dates detect DMY/MDY from a component over 12; ambiguous exports default to DMY. Timestamps without a zone default to IST (+330 minutes); callers can supply dateOrder/offsetMinutes. Invalid dates are discarded.
- Parsed sender names stay local until pseudonymise returns S01… and a separate browser-only keyMap. Known sender names, titled full names, phone numbers and emails are redacted; applications must let people review text for other personal details before submission. Attachment IDs are filenames or synthetic omitted-media IDs, not uploads.
- Photo quality uses prototype pixel thresholds, never AI confidence. Canvas re-encoding discards EXIF; crops must be made from the cleaned image. Helpers perform no network calls.

## A-T13
- All four prompt constants are exact copies of the Part E text blocks, with separate PROMPT_VERSION constants and byte-equivalence tests. The adapter uses prompt-specific schemas derived from shared contracts, then the read pipeline adds deterministic IDs, timestamps and provenance.
- Providers use native fetch with JSON Schema structured outputs, validated envelopes and Zod-validated data. Each operation gets two attempts maximum, with a 20-second timeout per attempt and one schema-error repair. Missing credentials return labelled fallback without a network call. Real provider behavior remains unverified until a key is supplied.
- The server factory reads LLM_PROVIDER and server-only keys. GEMINI_MODEL and OPENAI_MODEL may override the documented defaults. Browser entry points never import this factory. Provider request formats: https://ai.google.dev/gemini-api/docs/generate-content/structured-output and https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat .

## A-T14
- The server defensively pseudonymises chat again, resolves each sender over the whole chat, unions keyword hazards and preserves hazardous messages skipped by the model. Missing keys never produce fabricated photo facts; outputs are labelled fallback. Hazard questions remain incomplete unless explicitly answered in source text.
- Before provider calls, sharp also re-encodes incoming photos to JPEG with no metadata, bounds pixels and scales to 1600. B must still call browser stripExif before uploading. Route limits are 12 photos, 4 MiB decoded per photo, 2000 messages, 20000 characters per message, and 30 requests/minute/IP. The limiter is process-local (not distributed across Vercel instances).
- Cache keys hash the pseudonymised request, building ID, decoded photo bytes and prompt versions. Only validated live results are cached automatically, in bounded process memory and optional Supabase REST `ai_cache(cache_key, result)`; outages degrade gracefully. Bundled validated entries live in fixtures-ai/cache/bundled.json, initially empty until demo outputs are reviewed. SQL provisioning belongs to A-T23; local cache works without Supabase.
- Incidents share a key for the same known flat/zone within 72 hours of the first report; unresolved senders remain separate. Fixture chat is synthetic demo data with pseudonymous names; no photo evidence is fabricated.

## A-T15
- The thin Second Opinion route validates the input and output; any parsing/provider failure returns null with HTTP 200 as specified. Invalid methods and rate limits retain HTTP 405/429. The engine, not the route or model, caps the resulting claim.

## B2 final verification
- Added regressions for an English full name mentioned only in text and for ceiling complaints that mention a nearby duct. Capitalized multiword names are conservatively masked in addition to known senders and titled names; this remains a prototype recognizer, not a guarantee of detecting every name in every language.

## A-T23
- The link route accepts an optional validated state snapshot in addition to LinkRequest, because cases originate in B's browser engine. B supplies the latest state when creating a link; otherwise an existing stored case is required. No shared contract file is changed. Only available checks on safety-okay snapshots can issue links.
- HMAC-SHA256 tokens expire after 48 hours, bind case/check/flat/language and carry a random nonce. Only their SHA-256 hash is stored. A conditional PostgreSQL update claims the one-use token atomically before upload; competing submissions lose with HTTP 410. Failed uploads attempt private-object cleanup before releasing the claim; failed cleanup leaves it consumed.
- Multipart uploads require consent and all four negative safety answers, at most 4 MiB per image and 10 MiB total streamed bytes. Photos are re-encoded before any model/storage call and stored in a private bucket. Ghost URLs last 600 seconds and match case/flat/zone. Meter digits require two readable numeric strings and a valid interval; otherwise the surface is unclear and a retake is requested.
- A fresh local MAGIC_LINK_SECRET was generated in the ignored .env.local without printing it. Supabase remains unconfigured: routes return explicit HTTP 503 until server credentials and migration are supplied. Integration tests use an in-memory repository and synthetic images, not real resident photos.
- Migration was applied twice in local PGlite PostgreSQL with Supabase role/storage stubs: six tables have RLS, anonymous table access is denied and repeated memory events increment only once. This is not a remote Supabase or real-photo preview test.
- A-T23 final review fixed empty HTTP 201 handling for PostgREST minimal inserts and added case ownership. First creation stores a random owner-secret hash and sets an HttpOnly Secure SameSite=Strict cookie; subsequent case updates/link issuance require that cookie. Inserts never upsert over another owner. A recipient's signed check token cannot mint new links or replace the case. Regression tests reproduce both previous failures.

## A-T27 demo hardening

An explicitly missing provider key bypasses both complete-read and photo-label caches so the requested no-key check produces labelled fallback, even after a warm. With a configured provider, previously validated real outputs may still be used during provider outages and are labelled cached. No fallback output is promoted to live cache data. Upload photo caches bind cleaned image bytes and exact check/flat/instruction context, not a random upload photo ID; each upload receives fresh IDs. Identical meter images therefore cannot legitimately acquire different readings from repeated model calls; the meter test now supplies distinct images for its distinct mocked digit values.

The cache inventory lists every requested demo slot and fails complete coverage when real assets are missing. Only the supplied hero chat and authorized, cleaned team duct photo are currently available. Scenario, meter, trap and Day-14 images are not invented. `cache-demo.ts --live` is explicit provider opt-in; `--allow-missing` records partial coverage. The real raw duct image stays ignored; its clean public demo copy was explicitly authorized by the user and metadata checked.

## CP1 complete demo inventory

The user explicitly permitted labelled illustrations for unavailable demo photos. We reuse the authorized clean real duct photograph for the duct and happy-scenario input. Other missing slots use reproducible vector schematics with a visible DEMO ILLUSTRATION banner and cached simulated-input warnings, never fabricated natural photographs. Matching raw team files take precedence when present. All remain outside eval/data and do not count as human labels, field evidence or evaluation accuracy. Cache coverage means exact canonical manifest payloads and the declared upload contexts; arbitrary browser re-encodings/IDs can miss cache.

Photo-only requests skip the unrelated empty-chat model call. Their mode follows the actual photo source: fresh provider result is live, reused labels cached, unavailable labels fallback. Stored successful cache payloads retain the existing model-origin representation; no fallback is upgraded to live. A regression test proves one photo call and zero empty-chat calls across a renamed duplicate photo input.
