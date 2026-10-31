# A-T27 verification — 31 October 2026

## Confirmed

- Real HTTP `/api/read` against the local production build: one live hero read, then 20 sequential responses with `mode: "cached"` (20/20).
- A separate production server started with both provider keys empty, leaving `.env.local` unchanged: the already-warmed hero request returned `mode: "fallback"` and a `Labelled fallback` warning. A chat-plus-photo request returned fallback with `surface: "unclear"`.
- Missing-key `/api/second-opinion` returned HTTP 200/null. The engine's tested `applySecondOpinion(state, null)` path labels it `review_failed`, `source: "fallback"`, and the Job Sheet `unreviewed`.
- Missing-key cloud `/api/upload`: HTTP 200, fallback warning, checkId bound to `duct_photo@302`; reused token 410. This used a synthetic test photo, and the test case/storage object were removed.
- Regression tests cover twenty cache hits with one provider call, missing-key cache bypass, exact-context photo caching and no unavailable-label caching. Cached photo results are schema validated and rebound to the new upload's photo ID; meter readings still require two readable images.

## Coverage still pending

`fixtures-ai/cache/demo-status.json` is the authoritative inventory. The real hero chat and clean team duct photo are bundled; duct upload contexts are warmed in EN/HI/MR. Missing real scenario, meter, trap and Day-14 images remain marked missing. Synthetic evaluation placeholder images are not substituted. A-T27's requirement to cache every demo input is not complete until these assets are present and warmed.

## Prepare and warm assets

Raw images belong in ignored `eval/data/photos/`; never stage `_raw` files. `packages/ai/scripts/prepare-demo-photo.ts duct_302` (or `trap_502`) reads the matching raw file, re-encodes JPEG at quality 85 and maximum edge 1600, and refuses to write a fixture if EXIF, XMP, IPTC or ICC remains. GPS embedded in EXIF is removed with EXIF. It writes only `fixtures-ai/photos/demo/<name>.jpg`.

From the repository root with the project Node 20/pnpm 9 toolchain:

```sh
pnpm --filter @stacksense/engine exec tsx /Users/aaranachaurasia/dev/stacksense/packages/ai/scripts/prepare-demo-photo.ts duct_302
pnpm --filter @stacksense/engine exec tsx --env-file=/Users/aaranachaurasia/dev/stacksense/apps/web/.env.local /Users/aaranachaurasia/dev/stacksense/packages/ai/scripts/cache-demo.ts --live
```

The manifest declares exact IDs and paths. Update its scenario-photo paths to the actual team demo inputs before warming. `--live` is explicit provider opt-in. Missing assets/fallbacks fail coverage; `--allow-missing` permits an explicitly partial run. Valid model outputs are persisted in the bundled cache and optional server-side Supabase cache. Upload-oriented photos are additionally warmed for EN/HI/MR instructions. Cache keys include prompt versions, exact image bytes and context; changing IDs, encoding, instructions or message times can require a fresh warm. Never hand-author model labels and present them as live cache entries.

Missing keys deliberately select labelled fallback even for a warm request. A configured provider can use valid cached results during provider outages. Fallback outputs are never stored as successful model results. Full mobile-preview acceptance is tracked separately in `docs/UPLOAD_VERIFICATION.md`.
