# AI reader, review and privacy

StackSense uses models to read evidence and draft a cautious Second Opinion. The deterministic engine controls source odds, safety, check selection, claim caps, trade and statuses. Models do not determine responsibility or who pays.

| Function | AI contribution | Deterministic control |
| --- | --- | --- |
| Chat import | Structured damage reports in English/Hindi/Hinglish/Marathi | Browser parsing/pseudonyms, sender-flat resolution, incident grouping and hazard backstop |
| Photo | Visible surface, zone, boxes and readable meter digits | Metadata removal, quality checks, input limits; no photo-derived moisture reading |
| Second Opinion | Objection, evidence gaps, draft claim | Claim-level cap, unchanged posterior, trade/stop rules |
| Evaluation baseline | One source/trade answer using prompt E.4 | Evaluation-only output validation; unavailable baseline returns null |
| Weather/memory/simulator | None | Weather API/cache and deterministic engine/storage code |

## Prompts and validation

The four prompts are copied verbatim from Part E of the person-A build plan; a test checks exact equality. They live in `packages/ai/src/llm/prompts/`:

- `read-v1`: chat-to-observation labels; source message references, no guessed flat, conservative hazards.
- `photo-v1`: surface/zone, up to three normalized defect boxes and exact visible meter digits. It explicitly forbids guessing damp or unreadable numbers.
- `so-v1`: cautious reviewer; no probabilities, trades, cost, blame or liability.
- `base-v1`: evaluation-only single-LLM source/trade baseline. E.4 supplies no component claim, so the wrapper returns area specificity only when it identifies a flat, otherwise mechanism.

Provider requests use a JSON schema. Every model output is Zod validated. An invalid response or failed attempt gets one repair retry, then a conservative fallback. Each attempt has a 20-second timeout. Repair instructions contain schema errors, not secrets. Inputs embedded in prompts are data; this boundary reduces prompt-injection risk but does not guarantee correct extraction.

Both Gemini and OpenAI adapters are implemented. Keys come only from server `process.env`. The local live verification used `GEMINI_MODEL=gemini-3.1-flash-lite`; the default Gemini model encountered capacity errors during that test. Availability can change. We do not silently report fallback output as a successful model response.

## Boundaries and data flow

Browser consumers import only `@stacksense/ai/browser`, which exports WhatsApp parsing, pseudonymization and photo-preparation helpers. That entry point has no server/native-image/provider imports. Server routes import the separate server entry point. Native `sharp` is loaded dynamically inside guarded server code and externalized in Next's server build; it is a direct web dependency for pnpm resolution.

WhatsApp names/phone numbers/emails are pseudonymized in the browser; the server repeats pseudonymization defensively. The sender key map stays in the browser and is not sent to a provider. Known sender-name and common name patterns are redacted, but this prototype is not a guarantee of complete multilingual de-identification. Review real inputs before sharing them.

Before a photo is sent to a provider or saved by upload, it is decoded and re-encoded as JPEG at quality 85 with maximum edge 1600. EXIF/GPS metadata is stripped. Browser preparation also supports bounded detail crops and a clearly labelled edge-contrast view; this is not a moisture detector. Server upload accepts JPEG/PNG/WebP up to 4 MiB per image and bounds the actual streamed multipart body to 10 MiB. Invalid/oversized images are rejected.

The explicitly authorized team demo fixture is prepared from ignored `eval/data/photos/duct_302_raw.jpg` into a clean `fixtures-ai/photos/demo/duct_302.jpg`. The helper checks that EXIF, XMP, IPTC and ICC are absent before writing. Raw photos are never committed. A public demo fixture is intentionally shareable evidence; private resident uploads instead go to the private Supabase bucket.

## API behavior and fallback

| Endpoint | Result / limitation |
| --- | --- |
| POST /api/read | Shared `ReadResult`, including `mode: live/cached/fallback` and warnings |
| POST /api/second-opinion | Validated `SecondOpinion` or HTTP 200/null; engine turns null into explicit review-failed/unreviewed state |
| POST /api/link | Signed check-bound 48-hour link; safe/available checks only |
| GET /api/link/verify | Check instructions and optional private 10-minute signed ghost-photo URL |
| POST /api/upload | Consent plus four safety answers, photo(s), validated labels and observation bound to the requested checkId |
| GET/POST /api/memory | Professional-finding counts, persistent with Supabase; explicit localStorage fallback otherwise |
| GET /api/weather and /api/forecast | Attributed weather data or labelled cached weather/error; not model output |

Successful read/photo caches are checked first, including when provider credentials are absent. Uncached unavailable requests return labelled fallback; exhausted quota produces `Fallback (AI quota reached)` in ReadResult warnings. A Gemini 429 can use one distinct configured fallback model, then an explicitly configured compatible provider only if both Gemini models hit quota. Rejected models are not retried during schema repair. See [quota setup and exact environment variables](QUOTA_SETUP.md).

Chat fallback uses conservative deterministic extraction. Photo fallback remains unclear, never invents meter digits, and upload retains a labelled fallback warning. ReadResult warnings distinguish Live, Cached and Fallback honestly. B's UI must render mode/warnings and review-failed flags; HTTP 200 alone does not establish live AI.

Meter checks require two images and a positive time interval. Both digit strings must be readable numeric values with a nondecreasing reading; otherwise the result is unclear with a retake request. Photographs cannot prove moisture or paint readiness.

## Cache and demo coverage

Full read cache keys include building ID, pseudonymized messages, photo IDs/bytes and prompt versions. Photo-label cache keys additionally bind the exact cleaned image bytes to check type, flat and instruction, allowing upload retries/demo inputs to reuse validated labels without reusing observation IDs. Only successful model results are persisted as model cache entries. Cached responses remain labelled cached.

Caches use bounded process memory, optional server-side Supabase `ai_cache`, and checked-in `fixtures-ai/cache/bundled.json`. Keys hash evidence; cache values contain pseudonymized observations/labels and must still be treated as resident data. The demo manifest/status records coverage explicitly. All demo inputs other than the team duct photograph now use visibly labelled schematic DEMO illustrations with simulated-input cache warnings; these are never presented as field evidence or evaluation data. See [hardening evidence and commands](HARDENING.md).

## Links, storage and configuration

Magic links use HMAC-SHA256, a random nonce and a 48-hour expiry. Supabase stores a token hash rather than the bearer token. Consumption is an atomic conditional update, so repeated/concurrent use succeeds once. Case owners receive an HttpOnly Secure SameSite=Strict cookie; existing-case edits/link issuance require it. New cases need unique IDs. Resident recipients need the signed token, not the owner cookie. Use HTTPS for the deployed flow.

Database tables have RLS and browser/public access revoked; the service role is used only on the server. Private photos are served through short-lived signed URLs. Failed writes attempt storage cleanup before releasing a token; failed cleanup leaves it consumed. This prototype has no automated retention/deletion UI or full audit/compliance claim.

Server environment variables:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
LIVE_LLM_TESTS=0
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
MAGIC_LINK_SECRET=... # at least 32 bytes; retain the same secret across deployments
APP_ORIGIN=https://YOUR_CANONICAL_DEPLOYMENT
```

For an active compatible provider, configure OPENAI_BASE_URL, OPENAI_MODEL and OPENAI_API_KEY; select it directly with LLM_PROVIDER=openai or use LLM_FALLBACK_PROVIDER=openai after Gemini quotas. GitHub Models has retired; see QUOTA_SETUP.md. Never prefix a service-role key, model key or signing secret with `NEXT_PUBLIC_`. Set server variables in the deployment as well as ignored local `.env.local`, then restart/redeploy. Migration SQL is in `packages/ai/supabase/migrations/001_init.sql`.

Read/link routes apply process-local rate limits; these are not a distributed quota or abuse-prevention system. Model output can still be wrong despite schema validation, and a single photo cannot reveal hidden building defects. The human-labelled AI evaluation remains pending: the runner's placeholder dataset/results are explicitly synthetic smoke data, not measured accuracy. Current upload/mobile-preview acceptance is recorded in [upload verification](UPLOAD_VERIFICATION.md).
