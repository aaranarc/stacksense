# A-T27 verification — 31 October 2026

## Confirmed

- Real HTTP `/api/read` against the local production build: one live hero read, then 20 sequential responses with `mode: "cached"` (20/20).
- Historical pre-quota-policy check: a separate production server started with both provider keys empty, leaving `.env.local` unchanged: the already-warmed hero request returned `mode: "fallback"` and a `Labelled fallback` warning. A chat-plus-photo request returned fallback with `surface: "unclear"`.
- Missing-key `/api/second-opinion` returned HTTP 200/null. The engine's tested `applySecondOpinion(state, null)` path labels it `review_failed`, `source: "fallback"`, and the Job Sheet `unreviewed`.
- Missing-key cloud `/api/upload`: HTTP 200, fallback warning, checkId bound to `duct_photo@302`; reused token 410. This used a synthetic test photo, and the test case/storage object were removed.
- Regression tests cover twenty cache hits with one provider call, missing-key cache bypass, exact-context photo caching and no unavailable-label caching. Cached photo results are schema validated and rebound to the new upload's photo ID; meter readings still require two readable images.

## Canonical demo coverage

The 16 canonical requests use user-confirmed own ceiling, window, trap, meter-overview and duct photographs where appropriate. Happy/uncertainty previews share the ceiling image; the rain preview shares the window image. The second timed meter photo, actual Day-14 recapture and unmatched scenario scenes remain authored labelled DEMO illustrations. No previous stock/unverified photo is restored. Fixture display metadata changes do not convert scripted observations or readings into measured field evidence. The current manifest/status and exact upload contexts are authoritative.

## Prepare and warm assets

Raw images belong in ignored `eval/data/photos/`; never stage `_raw` files. `packages/ai/scripts/prepare-demo-photo.ts duct_302` (or `trap_502`) reads the matching raw file, re-encodes JPEG at quality 85 and maximum edge 1600, and refuses to write a fixture if EXIF, XMP, IPTC or ICC remains. GPS embedded in EXIF is removed with EXIF. It writes only `fixtures-ai/photos/demo/<name>.jpg`.

From the repository root with the project Node 20/pnpm 9 toolchain:

```sh
pnpm --filter @stacksense/engine exec tsx /Users/aaranachaurasia/dev/stacksense/packages/ai/scripts/prepare-demo-photo.ts duct_302
LIVE_LLM_TESTS=1 pnpm --filter @stacksense/engine exec tsx --env-file=/Users/aaranachaurasia/dev/stacksense/apps/web/.env.local /Users/aaranachaurasia/dev/stacksense/packages/ai/scripts/cache-demo.ts --live
```

The manifest declares exact IDs, paths and asset source. `generate-demo-illustrations.ts` never imports raw stock/reference files; it preserves explicitly approved clean team-photo entries and writes labelled schematics/SVG sources for illustration entries. Update its scenario-photo paths to the actual team demo inputs before warming. `--live` is explicit provider opt-in. Missing assets/fallbacks fail coverage; `--allow-missing` permits an explicitly partial run. Valid model outputs are persisted in the bundled cache and optional server-side Supabase cache. Upload-oriented photos are additionally warmed for EN/HI/MR instructions. Cache keys include prompt versions, exact image bytes and context; changing IDs, encoding, instructions or message times can require a fresh warm. Never hand-author model labels and present them as live cache entries.

The later quota policy supersedes the old missing-key cache bypass: known successful cached inputs remain Cached without keys; uncached requests receive labelled fallback. A configured provider can use valid cached results during provider outages. Fallback outputs are never stored as successful model results. Full mobile-preview acceptance is tracked separately in `docs/UPLOAD_VERIFICATION.md`.

Live warm-up, eval and health checks now require LIVE_LLM_TESTS=1; ordinary automated verification uses mocked transports and cached fixtures. See QUOTA_SETUP.md.

## Final A handoff recheck (31 October)

With LIVE_LLM_TESTS=0, the offline manifest audit reports all 16 exact demo requests and all 12 declared EN/HI/MR upload-label contexts cached. New regression runs every exact manifest request through the real read pipeline with an unconfigured adapter: all return Cached, never Live. It also sends 20 sequential requests through the HTTP handler and verifies an uncached request returns labelled Fallback. No warm-up or model call was made.

A local production server on port 3100 was started with GEMINI_API_KEY, OPENAI_API_KEY and remote-cache credentials explicitly empty (ignored .env.local was not modified). Actual HTTP hero requests: 20/20 Cached. A new chat in the real UI displayed Fallback and the deterministic-extraction warning. Second Opinion displayed Fallback / review failed / unreviewed; its HTTP result was 200/null. An uncached photo returned Fallback, surface unclear and null meter digits. The dashboard preserves its source badge across Job Sheet, Dry & Paint and Next Leak. Judge scenarios are deterministic Demo data, and /c/demo is a labelled Cached demo simulation; neither should be falsely relabelled as a live model call or a failed cache. The two outstanding B UI issues (encoded print ID and missing hero media resolver entries) remain in INTEGRATION_BUGS.md. Provider-disabled does not mean all successful cached results must say Fallback: that would contradict cache-first source labeling.
