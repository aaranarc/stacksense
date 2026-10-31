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

## B-001 — FIXED on b/app — verified locally and on branch preview

Owner: **B**. Priority: P0 for the hero import flow.

Reproduce: open production, click **Load demo chat**. The textarea fills, then displays **“Private browser preparation is unavailable. Use demo mode until it is connected.”** The case remains empty; the building does not light up from chat. Judge scenario playback separately works.

Cause confirmed in `apps/web/src/lib/adapters.ts` and `importChat.ts`: `browser` still spreads mock preprocessing and sets `available: USE_MOCK_API`; `readChat` rejects when real APIs are selected. Wire the actual `@stacksense/ai/browser` functions, adapting their return shapes, and retain browser-local keyMap privacy. Do not enable mock APIs to hide this defect: direct deployed /api/read already succeeds. A has not edited B's files.

## A-001 — CLOSED / VERIFIED IN PRODUCTION — deployed demo token disabled
B resolution: real parsing and pseudonymisation are connected; keyMap is never transmitted. Text-only imports skip both photo helpers. Metadata failures omit the unsafe photo with a labelled warning; quality failures retain only the stripped photo with a warning. Bundled demo text and its sanitised fallback match the canonical request. Both local mock flags are false. Local UI regression passes (Load demo chat → 402 victim); local `/api/read` returns 200 with five observations and a labelled fallback because this checkout has no provider key. Web typecheck, tests and production build pass. Branch-preview verification follows the push.

Preview verification for `d2a3787`: GitHub Vercel status success; https://stacksense-git-b-app-byte-me21.vercel.app/ returns 200, canonical demo text matches, `/api/read` returns cached with five observations, and the deployed page bundle contains the new preparation warnings and no old blocking gate. Automated browser control could not initialise (missing runtime asset path), so remote UI clicks were not verified; the local UI click regression passes.

## A-002 — OPEN — prevention inspection links have no matching ranked check

Owner: A. Next Leak renders engine `prediction.sameStack` entries, but the current check catalogue targets the victim/above/below flats only. `/api/link` requires a matching eligible `nextChecks` entry. This leaves new same-stack targets such as 602 without a creatable inspection link. B disables that unavailable action and labels it; B does not invent checks or bypass endpoint validation. Please expose an eligible inspection check or a supported prediction-link request.

## A-001 — preview configuration resolved; production retest pending

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

## Newly authorized own photos

The user confirmed a new set of attached images are their own. Matching images 2 (ceiling), 5 (window), 10 (unannotated trap) and 11 (meter overview) were copied to ignored *_own_raw.png files, re-encoded JPEG85 with maximum edge ≤1600, and checked for absent EXIF/GPS/XMP/IPTC/ICC. They use new *_own.jpg filenames; the removed prior stock/unverified files remain absent. Clean team duct remains unchanged. Hero/scenario display references now use the corresponding own photos; case evidence/timings/causes stay simulated. The meter overview is not a pair of readings; meter end and Day-14 remain labelled illustrations, as do unmatched scenarios. No hazard or actual repair timeline is invented from these attachments.

Own-photo cache update: all 16 canonical inputs and all declared EN/HI/MR upload contexts were warmed successfully with the explicit LIVE_LLM_TESTS=1 opt-in; no fallback was relabelled live. Thirteen obsolete illustration-cache keys were pruned from the bundle and Supabase. Removed corresponding replaced schematic assets. The only photographic inputs are the newly user-confirmed own ceiling/window/trap/meter overview plus the existing own duct photo; the removed earlier stock files remain absent. Original attachments and keys are not tracked.
## A-003 — OPEN — physical-phone answers need a dashboard refresh channel

Owner: A for an owner-authorised read/subscription API; B for consuming it once available. The upload handler stores the resident observation, but the current API routes provide no case refresh endpoint or subscription for the secretary's open dashboard. B-T23 accepts same-origin answers from its active phone iframe, with token/source validation. A separate physical phone cannot use that iframe channel. Please expose a supported refresh/subscription contract; do not bypass owner authorisation. The phone simulator can be recorded meanwhile. This does not prevent completing the resident upload itself.

## B handoff for CP2

B-001 and B-T21 through B-T27 are implemented on b/app. The mock engine/API flags are off locally; cached illustrations and scenarios remain explicitly labelled Demo data. C-owned judge files, A-owned packages/API routes and build tooling are unchanged. B's final web validation has 67 passing tests; the production build and full-workspace checks are recorded in the chat. Remote browser control could not initialise, so a visual preview click-through remains a human check. A-002 and A-003 require A-owned API work. A-001 now needs a production retest; preview configuration is resolved as recorded below.
### Final branch-preview verification — 31 Oct, 12:56 IST

App commit `ef8c12a` has Vercel status success. The branch preview returns 200, serves the exact bundled demo text, and its `/api/read` returns cached with five observations and zero warnings. Its deployed client includes the new panel states and preparation warnings, with no old blocking gate. The explicit demo-token helper now compiles to a direct `token === "demo"` check: preview demo mode is enabled, resolving the configuration part of A-001 on this branch. Production and visual mobile interaction are not reverified here. Browser control still cannot initialise; the local real-adapter Load demo click regression and mobile safety tests pass. Full-workspace typecheck and all 199 tests pass; web production build passes. Both local engine/API mock flags are false.


## CP2 production verification — 31 October 2026

Merged origin/a/core `2b0b527`, then origin/b/app `2a61976`, then origin/c/help `c002451` with --no-edit. Main result `e7422bd`. The only conflict was this chronological log; both sides were retained. No code ownership conflict occurred; A's sharp configuration remains. Install, recursive typecheck, 219 tests (3 contracts, 63 AI, 86 engine, 67 web), and web build passed before pushing main. Exact-commit Vercel deployment succeeded: https://vercel.com/byte-me21/stacksense/GT6tvFNx6guasQAapxpYhLvWNAzn . The following checks were performed on https://stacksense-omega.vercel.app after that success.

| Production check | Result |
| --- | --- |
| Page loads without login | PASS — dashboard accessible without authentication |
| Load demo chat lights the building | PASS — parsed complaints; 402/202 victims, 502 check passed; prior B-001 is closed by this production retest |
| /api/read Live or Cached | PASS — browser request POST /api/read HTTP 200, mode cached, five observations, warnings [Cached]; no fresh live LLM probe consumed quota |
| Judge Mode hero | PASS — six steps end with Job Sheet send waterproofer_tiler |
| What-if meter flip | PASS — moved meter produces probable 502 supply leak (95%) and Send plumber |
| Job Sheet PDF opens | FAIL — B-002 below; a tab opens but the Job Sheet content is unavailable |
| /c/demo completes at 390 px | PASS — actual 390×844, scrollWidth 390; consent, four explicit negative safety answers, camera/photo selection, Upload photo, Done. Used the existing clean team duct JPEG through the file input. Cached · Demo data explicitly says no real resident upload or AI interpretation; this does not claim a signed-link cloud upload test |
| IN/UK toggle | PASS — UK Block, 4 floors, managing-agent/floor-gully terminology and Shelter/Awaab links; switching back restores Block A and the meter-flipped plumber case |

### B-002 — OPEN — Job Sheet PDF has no content

Owner: **B** (Job Sheet export, case persistence and print route). Reproduce: Judge Mode → hero → Next step six times → Download PDF. New tab `/print/<caseId>` shows “This Job Sheet is unavailable in this browser. Open Download PDF from the case first.” Print / Save PDF is disabled. The popup sessionStorage contains the expected `stacksense:<caseId>` key, so this is not merely a blocked popup. The print route calls `loadCase`, which catches schema/parse failures and returns null; investigate the saved EngineState round trip. No successful PDF generation is claimed. No B-owned code was changed by A.

### B-003 — OPEN — Judge hero evidence photo previews unavailable

Owner: **B** (Judge fixture-to-media display integration; coordinate with C for Judge fixture IDs). Additional observed failure: after playing hero, the feed shows “Preview unavailable” for hero-ceiling-402, hero-window-202, hero-duct-302 and hero-trap-502. These are visible photo buttons but do not render the corresponding prepared own-photo assets. The canonical clean files and fixture mappings exist; the UI media resolver must connect the scenario photo IDs to those assets. This did not prevent deterministic hero or What-if results. No B/C-owned code was edited.

No new A-owned or C-owned failure was found in these eight acceptance checks. Previously recorded A-002 prevention-link eligibility and A-003 physical-phone dashboard refresh remain separate open handoffs; this checkpoint did not retest or close them. The older photo-only-read A-002 fix is included in the deployed A commits. Historical duplicate issue numbers above are retained without silently overwriting their different reports.


## Final A handoff — root causes and A fixes

- **A-002 prevention link eligibility — fixed on a/core, production pending.** Same-stack prevention targets now have `inspect@<flat>` ranked-check entries with safe photo instructions. They carry zero diagnostic information/score, so they do not prolong the diagnostic stop rule or create a neighboring diagnosis. Locked, unsafe and completed inspections remain unavailable. Hero regression covers 602 and its completion. Generated hero/scenario fixtures are refreshed.
- **A-003 owner refresh API — A backend fixed on a/core; B integration pending.** `GET /api/link/updates?caseId=<URL-encoded case ID>` returns a validated ReadResult of stored resident observations and photo labels, with Cache-Control: no-store. The existing HttpOnly owner cookie from POST /api/link (Path=/api/link) is required; absent/wrong ownership returns 403 before reading observation payloads. Poll with credentials same-origin, apply returned observations with photoLabels using the engine's deduplication, and do not POST them as new evidence. It is an all-current-answer response, not a change cursor. Upload now persists validated labels and fallback provenance in the existing JSONB observation payload; no migration is needed. Legacy answers without labels remain explicitly fallback. B must add polling/refetch on the owner dashboard; physical-phone auto-refresh is not claimed complete until B wires it.
- **B-002 exact cause — B-owned, not invalid A data.** Instrumented deployed Storage.getItem during print-page reload: lookup was `stacksense:block-a-<uuid>%3A402`, while the populated key is `stacksense:block-a-<uuid>:402`. The actual stored JSON validates against current EngineState. `apps/web/src/app/print/[caseId]/page.tsx:8` passes the still-encoded params.caseId directly to loadCase; `apps/web/src/lib/caseStore.ts:3` uses it verbatim. `apps/web/src/components/tabs/JobSheetTab.tsx:19` correctly URL-encodes the navigation segment. B should safely decode the route segment once before lookup (and cover encoded colon with a production-style route regression). No contract, engine or cached API defect caused this failure. Earlier speculation about a schema failure is superseded by this measured key mismatch.
- **B-003 exact cause — B-owned media resolver.** `apps/web/src/lib/media.ts:3` recognizes only P402/P202/P302/P502; `:10` returns null for all engine hero-* photo IDs. `apps/web/src/components/feed/CaseFeed.tsx:15` renders Preview unavailable for that null. `packages/engine/src/scenarios/hero.ts:22` and `:35` correctly reference hero-ceiling-402 and hero-duct-302; prepared matching paths exist in `fixtures-ai/photos/demo/assets.json` and generated fixture demoAssets.images. Runtime engine state intentionally contains IDs rather than browser URLs, and Judge runtime generation does not register display assets. B should register/serve the approved own-photo mapping (or consume the fixture display metadata) for hero-ceiling-402, hero-window-202, hero-duct-302, hero-trap-502 and hero-day14-402; Day-14 must retain demo-illustration labeling. Changing valid fixture IDs would lose the established bindings. A did not edit B/C-owned UI files.

Final no-key hardening: 16/16 canonical inputs and 12/12 upload-label contexts cached in offline audit; exact-input regression and 20 sequential handler requests pass without a configured adapter. Local production server with both provider keys and remote-cache credentials empty returned Cached for 20/20 actual hero HTTP requests. Fresh UI chat and uncached photo returned labelled Fallback; Second Opinion returned null and displayed review failed/unreviewed. No live LLM call was made. Known caches and explicit demo screens remain honestly Cached/Demo data rather than being mislabelled Fallback. Key removal did not fix or conceal B-002/B-003.

## FINAL A handoff — deployed production acceptance

A's final authorized merge was **only origin/a/core** into main, fast-forwarding to `927094b`. No newer b/app or c/help changes were merged. Install, recursive typecheck, all **223 tests** (3 contracts, 66 AI, 87 engine, 67 web) and web build passed before the push. The main production deployment completed at https://vercel.com/byte-me21/stacksense/4PXkgpUjadpwgEHEWaCSStF2nFyu . An earlier success for the same SHA belonged to a/core; production was reloaded and all checks repeated after the main deployment appeared. The served client bundle includes the new prevention inspection code, and the new owner-refresh endpoint is active.

| CP2 check after final main deploy | Result |
| --- | --- |
| No login | PASS — fresh production dashboard loads directly |
| Load demo chat lights building | PASS — 402/202 victim states, 502 check-passed state |
| /api/read Live or Cached | PASS — the actual UI POST returned HTTP 200, mode cached, warnings [Cached], five observations |
| Judge hero | PASS — all six steps, Job Sheet sends waterproofer_tiler |
| What-if meter flip | PASS — moved meter sends plumber, probable 502 supply leak 95% |
| Job Sheet PDF | FAIL — B-002 remains: print tab says Job Sheet unavailable and Print / Save PDF is disabled; encoded-ID root cause/file lines above |
| /c/demo at 390 px | PASS — actual 390×844 and scrollWidth 390; consent, four explicit No answers, clean own duct JPEG selection, Upload photo, Done. Cached/Demo simulation warning is visible; not a signed-link cloud test |
| IN/UK toggle | PASS — UK Block and managing-agent terminology, Shelter links, then IN restores the prior plumber case |

Additional checks: **B-003 remains OPEN**: four hero photo buttons show Preview unavailable. **A-002 prevention backend CLOSED/DEPLOYED**: hero Next Leak now enables Send inspection link for 302 and 602; no link was sent externally during this check. **A-003 backend CLOSED/DEPLOYED**: GET /api/link/updates without the owner cookie returns 403 with no-store, as required; mocked repository/handler tests cover authorized answer/label retrieval and fallback provenance. **B integration remains OPEN** for consuming that endpoint to refresh the dashboard after a physical-phone upload. A-001 configuration and the separate photo-only-read A-002 bug remain closed. No new A/C failure was observed. No live LLM call, secret disclosure, hard-case read or evaluation run occurred.

Final remaining integration list: B-002 print decode; B-003 hero media resolver; B owner-dashboard refresh wiring. Full final evaluation/AI labels, real phone footage, video/submission and final release are separate B/C/human items in docs/HANDOFF_A.md. This documentation-only result commit changes no deployed application behavior.

**Authority transferred:** C is now the sole main merger and may fix packages/** and apps/web/src/app/api/** bugs. A performs no further merges after this handoff. Root AGENTS.md records the user override. No force-push or history rewrite was used.

## B final run — B-002 fixed on b/app
The print-route boundary now safely decodes its case ID exactly once before storage lookup. The original storage key and export URL encoding remain intact. Regression coverage renders the actual encoded-colon route with a validated stored Job Sheet and confirms populated content plus enabled Print / Save PDF; malformed and double-encoded segments are handled without guessing. This is a branch fix pending C's main merge and production retest.

## C merge 1 — main 467a1f5 (31 Oct, 14:44 IST) — CP2 production verification by C
C (sole main merger after A's handoff) merged origin/a/core (927094b, already in main) → origin/b/app (5cd02dc, includes
B-002 fix) → origin/c/help into main; fast-forward, no conflicts. Install, recursive typecheck, all tests (3 contracts,
66 AI, 87 engine, 70 web) and web build passed before the push. Vercel status for the exact SHA 467a1f5: success.
Engine evaluation rerun on this tree: numbers unchanged vs v1 (eval/results/engine.json).

| CP2 check on https://stacksense-omega.vercel.app (after 467a1f5 deploy) | Result | Owner if failing |
| --- | --- | --- |
| No login | PASS | — |
| Load demo chat lights building | PASS — 402/202 victims, 502 check passed | — |
| /api/read Live or Cached | PASS — POST 200, "Cached · Demo data" | — |
| Judge hero | PASS — 6/6, "Job Sheet: send waterproofer tiler" | — |
| What-if 502 meter → moved | PASS — Job Sheet sends plumber; flipped back restores waterproofer tiler | — |
| Job Sheet + PDF | PASS — **B-002 CLOSED**: /print/<encoded id> populated (send/don't send/verify/not justified), Print / Save PDF enabled | — |
| Judge photo previews | **FAIL — B-003 OPEN**: 4× "Preview unavailable" in the case feed while playing the hero; no images | **B** (lib/media.ts) |
| /c/demo at 390×844 (emulated) | PASS — consent → 4× No → own clean duct_302.jpg → Upload → "Done", Cached/Demo labels, no horizontal overflow | — |
| IN → UK → IN | PASS — UK Block 4 floors, gov.uk/Shelter links; back to IN restores Block A case and Indian links | — |
| Colours follow visual rules | PASS — every flat status has a text label next to its colour (victim / check passed / inspect / not assessed) | — |

Still open: B-003 (B), B owner-dashboard refresh wiring (B), CrossSection `<title>` hydration warning in dev (B, see
C_REQUESTS.md). No live LLM call, key disclosure or hard-case edit occurred in this check.

## B final run — B-003 fixed on b/app
The media resolver now binds all approved hero IDs, meter references and scenario preview IDs to public copies of A's clean cached assets. Hero ID bindings remain unchanged. Tests compare served hero bytes with the approved originals and verify own-photo-reference versus Day-14 illustration labels. Scenario evidence/timing remains labelled simulated. No judge or engine file was edited. C should retest hero thumbnails and the photo drawer after merging.

## C merge 2 — main bc852f3 (31 Oct, 15:02 IST)
Merged origin/a/core (927094b, no change) → origin/b/app (84d0b07, B-003 media) → origin/c/help (a9c51a2). One conflict in
this log only (C merge 1 vs B "B-003 fixed" section, same insertion point): kept both, chronological. Install, typecheck,
tests (3 / 66 AI / 87 engine / 72 web) and build passed; Vercel status for bc852f3: success.

| Production re-check after bc852f3 | Result | Owner |
| --- | --- | --- |
| Load demo chat → building, /api/read | PASS — Cached · Demo data, 402/202 victims, 502 check passed | — |
| Judge hero → waterproofer tiler | PASS — 6/6 | — |
| Judge photo previews | **PASS — B-003 judge path CLOSED**: ceiling_402_own, window_202_own, duct_302, trap_502_own all HTTP 200 and rendered | — |
| Demo-chat attachment previews | **FAIL — B-003b OPEN**: after "Load demo chat" the two chat attachments (IMG-20261030-WA0402.jpg, IMG-20261030-WA0202.jpg) still show "Preview unavailable" | **B** (lib/media.ts mapping for chat attachment IDs) |
| Evaluation card | PASS — label shown; single-LLM row "pending — free-tier AI quota (16/30 hard cases answered)" | — |

## B final run — B-STATUS fixed on b/app
Leading source flats are red and labelled probable source; other assessed candidates are amber. Green requires a named, dated dry check with answered safety questions and usable dry labels; denials, unrequested dry reports, poor-quality photos and superseded wet checks do not qualify. New prevention inspections remain amber. SourceBars uses a single red leading bar and neutral grey alternatives, never green. Tests cover these cases.

## B final run — B-REFRESH consumes the deployed A-003 API
The owner dashboard now fetches /api/link/updates with same-origin credentials and no-store. It supports manual/focus refresh and twelve ten-second polls after a successful link creation; 403 stops automatic requests. Case changes abort in-flight requests and ignore stale replies. New observation IDs and labels are applied through the engine with a non-decreasing answer timestamp; repeated all-current snapshots preserve local human corrections and do not duplicate evidence. The phone frame closes when its check is answered externally. Local tests cover authorization, credentials, bounded polling, stale responses, idempotence, timestamps and external frame dismissal. Local cloud credentials are absent; the configured branch preview will be used for signed-link verification.

## B final run — B-AUDIT
Reviewed the full chronological report and A handoff after merging main. B-001 and the prior CrossSection title hydration defect are already fixed. B-002/B-003/B-STATUS/B-REFRESH are pushed on b/app for C. A's deployed inspect targets now enable the existing 302/602 UI buttons; a regression validates the current generated engine fixture. No packages/API/judge/root-config change was made by B. Remaining app verification and /c/demo preview/polish work are tracked in apps/web/FINAL_STATUS.md.

## B final run — B-T23 explicit demo phone preview
Added Preview demo phone beside the safe neighbour-check controls. It opens /c/demo in the phone frame with an explicit Cached/Demo notice and closes on completion. Demo answers do not alter the current case; signed answers still update it through the real API/frame/refresh paths. Both launch and non-application of demo evidence have regression coverage.

## C merge 3 — main 480c43f (31 Oct, 15:15 IST)
Merged origin/a/core (927094b, no change) → origin/b/app (422a3a2: B-STATUS, B-REFRESH, B-AUDIT, B-T23 demo phone
preview) → origin/c/help. The log-only conflict (C merge 2 vs B's four new sections) was resolved on c/help keeping all
sections chronologically, then main merged c/help (which contains b/app 422a3a2). Install, typecheck, tests (3 / 66 AI /
87 engine / 87 web) and build passed; Vercel status for 480c43f: success.

| Production re-check after 480c43f | Result | Owner |
| --- | --- | --- |
| No login; Load demo chat lights building | PASS — 202/402 victim, 502 probable source (B-STATUS text labels) | — |
| /api/read | PASS — Cached · Demo data | — |
| Judge hero / What-if meter | PASS — waterproofer tiler; moved → plumber; flip back restores | — |
| Job Sheet + PDF | PASS — populated, Print / Save PDF enabled | — |
| Judge photo previews | PASS — 4/4 rendered | — |
| Demo-chat attachment previews | **FAIL — B-003b OPEN** (2× Preview unavailable after Load demo chat) | **B** |
| /c/demo at 390×844 | PASS — consent → 4× No → camera step enabled, Demo label, no overflow (full upload verified in merge 1) | — |
| IN → UK → IN | PASS — UK Block 4 floors + gov.uk/Shelter links; IN restores Block A | — |
| Colours | PASS — red = probable source, amber = victim/inspect, every colour has a text label | — |

## B final run — B-003b fixed on b/app
Mapped canonical demo-chat attachment IDs IMG-20261030-WA0402.jpg and IMG-20261030-WA0202.jpg to the same approved cached ceiling/window assets and labels as their hero preview IDs. Added a regression using A's actual bundled chat result: Load demo chat renders both thumbnail paths and each PhotoViewer image, with own-photo reference and simulated-case labels. No API, package, judge or root-config file changed. Pending C's merge and production retest.
