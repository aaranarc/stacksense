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
