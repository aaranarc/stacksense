# CP1 integration checks

Production: https://stacksense-omega.vercel.app/

Merged A `9fe98e0`, B `30823b2`, C `997e9ce`, in that order, into main `813d535`. No content conflicts. A's sharp dependency/dynamic import/serverExternalPackages are preserved. Install, typecheck, 180 tests, and web build passed. Vercel's GitHub status for this exact main SHA became success: https://vercel.com/byte-me21/stacksense/Hos2dkHJyc8Jik3Gevgw3eBn1PFi . The following checks were on deployed production, not localhost.

| Check | Result |
| --- | --- |
| Page loads without login | PASS: 200, StackSense app |
| Load demo chat → building lights up | FAIL: B-001 |
| POST /api/read with canonical hero | PASS: 200, cached, 5 observations, no warnings |
| Judge Mode → hero completion | PASS: step 6/6, Job Sheet sends waterproofer_tiler (displayed as “waterproofer tiler”) |
| /c/demo at actual viewport 390×844 | PASS after A-001 deployment fix; initial failure retained below |

## B-001 — OPEN — demo import blocked by browser adapter

Owner: **B**. Priority: P0 for the hero import flow.

Reproduce: open production, click **Load demo chat**. The textarea fills, then displays **“Private browser preparation is unavailable. Use demo mode until it is connected.”** The case remains empty; the building does not light up from chat. Judge scenario playback separately works.

Cause confirmed in `apps/web/src/lib/adapters.ts` and `importChat.ts`: `browser` still spreads mock preprocessing and sets `available: USE_MOCK_API`; `readChat` rejects when real APIs are selected. Wire the actual `@stacksense/ai/browser` functions, adapting their return shapes, and retain browser-local keyMap privacy. Do not enable mock APIs to hide this defect: direct deployed /api/read already succeeds. A has not edited B's files.

## A-001 — CLOSED / VERIFIED IN PRODUCTION — deployed demo token disabled

Owner: **A (Vercel configuration)**. Priority: P1.

Reproduce: open `/c/demo` at 390×844. It displays **“This link has expired or was already used. Ask for a new link.”**, with Retry; consent/safety screens are unavailable.

Vercel's project variable list has no `NEXT_PUBLIC_DEMO_MODE`. B's `residentApi.isDemo` intentionally requires that flag or mock API mode before using the labelled cached demo token. Fixed: saved `NEXT_PUBLIC_DEMO_MODE=true` as a non-sensitive Config variable for Production/Preview, completed Vercel reauthentication with the user, and rebuilt main `9de3697` without build cache. Deployment: https://vercel.com/byte-me21/stacksense/3Lob492uKGtJ8RQ7XEgPmXoMr9zZ . On production, Chrome reported actual innerWidth 390, innerHeight 844 and scrollWidth 390. Consent → four explicit negative demo safety answers → camera → clean team photo selection → Upload photo → Done all passed. Result displayed Cached · Demo data and explicitly warned that the demo did not perform a real resident upload or AI interpretation. This affects only the explicit demo token; signed resident links continue through their server verification.

## Ownership and next checkpoint

No C-owned failure was observed in the requested checks. Raw team photographs remain ignored. Screenshots are local in `work/cp1-hero.png` and `work/cp1-mobile-failure.png`. After the user says **CP2 merge**, repeat fetch; merge origin/a/core, then origin/b/app, then origin/c/help into main; use B's version on conflicts in B-owned web files, C's in components/judge, preserve sharp; install/typecheck/test/build; push only green; wait for the exact main deployment; repeat all five production checks and update this log.

## A-002 — FIXED ON a/core — photo-only reads called the chat model

Owner: **A**. Found while warming the remaining demo inputs: requests containing only a photo still sent an empty message list to the chat model, and a failed empty-chat call made otherwise usable photo labels fall back. The regression test reproduces this with a provider that accepts photos and rejects empty chats. Photo-only reads now skip chat extraction; reused model labels are labelled cached and fresh labels live. Missing-key photo reads remain explicit fallback. This code is queued for the next main merge, not claimed deployed at CP1.

## Final CP1 follow-up status

B-001 is the only remaining requested production-check failure and was reproduced again after the demo-mode rebuild. Direct production /api/read was cached; Judge hero reached the correct trade; /c/demo completed at 390×844. No C-owned failure was found. A-001 is fixed live; A-002 is fixed/tested on a/core for CP2.

A-T27: all 14 canonical manifest requests are cached, including eight scenario inputs, meter pair, trap and Day-14; duct, meter and trap upload contexts cover EN/HI/MR. The supplied real duct photo is used where applicable; unavailable real scenes use eleven visibly labelled schematic DEMO illustrations with simulated-input cache warnings. These are not field photographs, real meter readings or human-labelled evaluation data. `fixtures-ai/cache/demo-status.json` has complete=true. 183 tests, recursive typecheck and web build pass. New code/cache assets are pushed to a/core for CP2, not silently merged into production.

## Rotated Gemini key — 31 October 2026

The user set a new GEMINI_API_KEY locally and in Vercel. No key value was printed, copied into this report or committed.

| Environment | Verification | Result |
| --- | --- | --- |
| Local production server | One POST /api/read at 12:06:43 IST with a new UUID message ID and timestamp, one short synthetic ceiling-stain report, no photos | HTTP 200; mode **live**; one validated observation; no warnings; 7,134 ms |
| Production after refreshing current main | One fresh UUID/timestamp chat POST after deployment DZbtPyrULzRhj8oa6pz1xJe8Z4gp became Ready and acquired the production domain | **PASS** at 12:20:05 IST: HTTP 200; mode **live**; one observation; no warnings; 2,826 ms |

The local server was restarted with the updated ignored .env.local and stopped after this check. Local and production use a shared optional Supabase cache, so do not reuse the local payload verbatim for the production key test. The production key check is now complete, independently of CP2. The standard five CP1/CP2 checks still apply at the next requested checkpoint. Do not initiate CP2 until the user says **CP2 merge**.

### Real-photo replacement audit

At this check, eval/data/photos/ contains only duct_302_raw.jpg. Re-encoding it again at JPEG quality 85 and maximum edge 1600 produced the existing clean 1200×1600 fixture byte-for-byte. EXIF/GPS, XMP, IPTC and ICC are absent. The real duct and happy-scenario slots already use this photograph, and their cache bytes still match. No additional matching real team shot exists for the remaining illustration slots, so no illustration was relabelled as a photograph and no unchanged input was needlessly re-cached. Raw files remain ignored and untracked. When matching shots are supplied, replace only those slots, update assetSource to team-photo, strip metadata and warm the changed canonical read/upload contexts.

### Production redeploy and rotated-key confirmation

Vercel showed that the previous current-production deployment (3Lob492uK, main 9de3697, built before the key update) predated the secret change. An initial fresh request on that deployment returned live, but was not used as proof of the rotated key. At the user's request, current main was explicitly redeployed with the latest Project Settings and build-cache reuse disabled; no branch merges or key disclosure were needed.

Verified deployment: https://vercel.com/byte-me21/stacksense/DZbtPyrULzRhj8oa6pz1xJe8Z4gp . Vercel reported Ready, source main 9de3697, and assigned https://stacksense-omega.vercel.app . Only then was a different, unique UUID/timestamp short synthetic chat sent once to production /api/read. Result: HTTP 200, mode live, one observation, no warnings, 2,826 ms, at 12:20:05 IST on 31 October 2026. This was not a cached hero or a replay of the local/pre-deploy request. The secret value was neither revealed nor written to this report.

## Photographic demo update

Found the supplied matching WhatsApp images in Downloads and copied ceiling_402_raw.jpg, window_202_raw.jpg, trap_502_raw.jpg and meter_502_a_raw.jpg into ignored eval/data/photos/. Clean copies were re-encoded at JPEG quality 85, maximum edge 1600; EXIF/GPS, XMP, IPTC and ICC absence verified. The existing clean duct photo remains. No raw file or key is tracked. The window stock watermark is retained; these additional photographs are labelled DEMO photographic references, not verified team-captured field evidence.

Hero/scenario fixture display mappings now point to the clean ceiling/window/trap/duct references and a separately identified meter example. Scripted observations, odds and timing remain simulated. Only one meter image exists, so no real paired measurement is claimed; meter B and Day-14 remain DEMO illustrations. Happy and uncertainty previews use the ceiling image, rain uses the window reference; electrical/locked/dark/lateral/Break-it previews remain illustrations. All 16 canonical inputs and declared EN/HI/MR upload contexts were re-cached successfully before the subsequent quota-policy change.

## Quota-safe AI policy

Implemented bounded 429 fallback, optional explicitly configured compatible provider, cache-first known inputs, quota-specific ReadResult warnings and LIVE_LLM_TESTS=1 guards. No real LLM calls were used for verification. Tests/eval/warm-up/health probes must not consume live quota without that flag; this supersedes any earlier instruction to run an automatic fresh live-key probe during a checkpoint. Normal CP2 can check the known cached hero. Exact Vercel variables and the GitHub Models retirement limitation are in docs/QUOTA_SETUP.md. The previous successful local/production rotated-key tests remain historical results; no new live probe was run for this change.

Quota verification: 199 tests, recursive typecheck and web build passed. Mocked tests cover primary/fallback/compatible 429 transitions, terminal 429 without repeat calls, selected-provider schema repair, no failover on 503, cache recovery, no further uncached-photo requests after exhaustion, native transport blocking, explicit provider configuration, and guarded standalone/evaluation commands. LIVE_LLM_TESTS=0 warm-up and evaluation commands both refused before making requests. No live health/evaluation/provider probe was run for this change. The quota implementation is on a/core pending the next authorized main merge/deployment.

## Stock/unverified image removal — current product policy

Removed the four supplied stock/unverified photographic files from the current tracked tree using git rm: ceiling_402.jpg, window_202.jpg, trap_502.jpg and meter_502_a.jpg. Replacement authored schematics use distinct demo paths, visible DEMO ILLUSTRATION banners and matching SVG sources. The team duct photograph is the sole real photo. Hero/scenario display metadata and canonical request/upload caches are regenerated; old stock-based cache keys are pruned from the bundle and purged from Supabase. Historical references in this chronological log describe superseded work, not current assets.

Normal git rm removes files from this and subsequent revisions but cannot remove prior committed blobs from shared history. No history rewrite or force push was performed. Raw copies remain ignored local files and are not product inputs. The generator no longer auto-imports raw/reference files, preventing accidental reintroduction.
