# Final A handoff to B and C

Production: https://stacksense-omega.vercel.app

The user's final instruction supersedes the original plan's merge ownership: after A's one final a/core-only handoff merge, **C (person C, Claude Code) is the only main merger**. C may fix bugs in packages/** and apps/web/src/app/api/**. B continues to own the app outside API routes and judge components; C owns components/judge/. Keep the contract stable and preserve privacy/safety rules. A will not perform another merge after this handoff.

## Run locally

Use Node 20 and pnpm 9. From the repository root:

```sh
pnpm i
pnpm -r typecheck
pnpm -r test
pnpm --filter web build
pnpm --filter web dev
```

This Mac also has an ignored local toolchain. If pnpm/Node is unavailable in the shell:

```sh
export PATH="$PWD/work/toolchain/node_modules/.bin:$PATH" COREPACK_HOME="$PWD/work/corepack"
```

Use ignored apps/web/.env.local for local server settings; configure Production/Preview variables separately in Vercel, then redeploy when they change. Never print or commit keys. Run the Supabase migration packages/ai/supabase/migrations/001_init.sql in the project's SQL editor if starting a new database; the current project was already migrated. No new SQL migration is required for the handoff refresh API.

## Environment variable names only

| Purpose | Names |
| --- | --- |
| Provider selection / Gemini | LLM_PROVIDER, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL |
| Optional explicitly configured compatible provider | LLM_FALLBACK_PROVIDER, OPENAI_BASE_URL, OPENAI_MODEL, OPENAI_API_KEY |
| Diagnostic/evaluation live-call opt-in | LIVE_LLM_TESTS |
| Server storage/cache and private uploads | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| Link signing and canonical origin | MAGIC_LINK_SECRET, APP_ORIGIN |
| Public demo and adapter flags | NEXT_PUBLIC_DEMO_MODE, NEXT_PUBLIC_USE_MOCK_ENGINE, NEXT_PUBLIC_USE_MOCK_API |

Public Supabase variables used during initial setup (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) do not replace the server storage credentials; this server implementation does not consume them. Never put model/service-role/signing credentials in any NEXT_PUBLIC variable. Preserve the signing secret across deployments. Public adapter flags must select real adapters for integration verification; demo mode enables only the explicit /c/demo simulation. Exact configuration semantics/defaults are in QUOTA_SETUP.md; no credential values are included here.

## What shipped from A

Pure deterministic engine, shared Zod contracts, browser privacy/photo helpers, bounded model adapters, validated read/review APIs, weather/memory, signed one-use links/private upload and cached demo inputs. All 16 canonical read inputs plus 12 declared multilingual upload-label contexts are cached. Unit and real local HTTP checks cover twenty sequential cache hits without keys. Unknown inputs degrade to labelled fallback; photos never invent digits/moisture.

Prevention same-stack entries now have safe inspect@flat link targets, with zero diagnostic score. GET /api/link/updates?caseId=<encoded ID> returns a ReadResult of all stored resident answers and labels, using the existing HttpOnly case-owner cookie from POST /api/link. It is no-store and rejects missing/wrong ownership with 403. B should refetch on focus/manual refresh or bounded polling, send same-origin credentials, and apply observations plus photoLabels through the engine. Advance caller-supplied case time to the answer timestamp where appropriate. The response has no cursor; repeated answers must be deduplicated. Legacy rows without stored labels are explicitly fallback. It returns private observations, not public photo URLs. Keep Supabase service credentials server-side.

Own clean photos: duct_302.jpg, ceiling_402_own.jpg, window_202_own.jpg, trap_502_own.jpg and meter_502_own.jpg. The meter overview is not a readable timed pair. Meter end, Day-14 and unmatched scenes remain labelled demo illustrations. Original raw files are ignored. The earlier stock/unverified files were removed from current/subsequent trees; old committed blobs were not force-rewritten. Assets/mapping: fixtures-ai/photos/demo/assets.json. Scenario evidence, flat IDs, timing and odds remain simulated even when a real photo supplies its preview.

## Merge procedure — C only after this handoff

Fetch all. On a clean main, merge origin/a/core, then origin/b/app, then origin/c/help with --no-edit. On conflicts use B's version in B-owned apps/web files except api/** and components/judge/**; C's version in components/judge/**; A's version in packages/** and api/** unless C is deliberately applying an authorized bug fix. Preserve A's dynamic server-only sharp import, web sharp dependency and serverExternalPackages while retaining B's Next configuration. Preserve both parties' chronological integration-log entries and review the result. Do not choose a branch wholesale for root/shared files or silently drop fixes.

Run pnpm i, recursive typecheck, recursive tests and web build before pushing main. Never push red or force-push. Wait for the Vercel status for the exact pushed SHA to succeed before checking production; do not infer deployment completion from a successful git push. A's final merge deliberately includes only origin/a/core, not subsequent unreviewed B/C branch changes.

## CP2 production checklist

Use https://stacksense-omega.vercel.app after the exact main deployment:

1. Dashboard loads without login/protection.
2. Load demo chat → parsed complaints and building lights up (402/202 victims; 502 denial/check status).
3. Inspect its POST /api/read: HTTP 200 and honest Live or Cached. Use the exact known hero; no uncached health probe without diagnostic opt-in.
4. Judge Mode → hero, Next step through all six steps → Job Sheet send waterproofer_tiler.
5. What-if 502 meter still → moved → Send plumber; toggling is evidence simulation.
6. Download PDF opens a populated Job Sheet print view; Print / Save PDF must be enabled. Merely opening an empty tab is a failure.
7. /c/demo at actual 390×844: consent → all four explicit No answers → clean photo → Upload → Done, with Cached/Demo labeling and no horizontal overflow. This is not proof of a signed-link real cloud upload.
8. IN → UK → IN changes building/terminology/responsibility links and restores the previous region's case.

Record every failure and owner in INTEGRATION_BUGS.md, commit/push the report, and keep unresolved failures visible. Do not fabricate a pass from unit tests. Also inspect Judge photo thumbnails while playing the hero.

## Gemini 429 and unavailable AI

Cache first. Primary 429 → one attempt on the distinct fallback model → optional compatible provider only if both Gemini models hit 429 and explicitly configured. Never loop or restart rejected models during repair. Invalid JSON/schema has at most one selected-stage repair; terminal failure becomes fallback. Cached and Fallback (AI quota reached) are acceptable, honest results. No paid fallback is implicitly configured. The team reports a tiny free daily quota; the application is not a distributed quota counter. Do not turn on billing, change tiers or repeatedly run live checks/eval to make a demo badge say Live.

Tests, eval, warm-up and health diagnostics must not call a live model unless LIVE_LLM_TESTS is explicitly enabled for that run. Leave normal checks offline/cache-only. Normal interactive web requests may call a provider when configured; the opt-in is not a global production-disable switch. If testing without a key, clear both provider keys in a separate process and keep .env.local untouched. Successful known cache hits remain Cached; uncached inputs are Fallback, Second Opinion becomes null → review_failed/unreviewed, and unreadable photos stay unclear. The explicit resident demo and Judge scenarios remain labelled simulated data.

## Known issues and remaining work

- B-002: print route passes still-encoded caseId to storage lookup. apps/web/src/app/print/[caseId]/page.tsx:8 and lib/caseStore.ts:3. Browser instrumentation proved %3A lookup versus : key; stored EngineState validates. B must safely decode once and test the real encoded URL. No A schema/API change is needed.
- B-003: apps/web/src/lib/media.ts:3,10 handles only P402/P202/P302/P502 and returns null for hero-* IDs. CaseFeed.tsx:15 displays Preview unavailable. B must connect the approved hero asset mapping/public serving; preserve Day-14 illustration labeling. Coordinate Judge display changes with C.
- A-002 prevention backend and A-003 refresh backend are fixed here. B must consume the new refresh endpoint; physical-phone automatic dashboard refresh is still an integration item. A-001 demo configuration and photo-only read bug were previously fixed.
- Human-labelled AI evaluation is incomplete; placeholder/synthetic smoke results are not measured accuracy. C owns final evaluation/baselines/numbers and must preserve provenance. A did not open eval/hard-cases or rerun final evaluation during this handoff. The unavailable single-LLM baseline must remain pending, not scored as a success.
- Real phone footage, B's full signed-link dashboard flow/recordings, video/submission, final release/tag and any remaining B/C plan tasks are not completed by this handoff. Do not infer whole-plan completion from green checks.
- Prototype inference/priors, correlated evidence, privacy-pattern coverage, local rate limiting, no retention UI and unavailable AI remain documented limitations in engine.md and ai.md. Always verify the probable source on site; a photograph is not a moisture measurement.

The final deployed verification will be appended to INTEGRATION_BUGS.md. C owns subsequent merges and may repair packages/API bugs without waiting for A's return.

## Final deployed result

Final application main SHA: 927094b. Production deployment: https://vercel.com/byte-me21/stacksense/4PXkgpUjadpwgEHEWaCSStF2nFyu . Install/typecheck/223 tests/web build passed. Seven of eight CP2 checks pass; PDF remains B-002, and additional photo-preview failure B-003 remains. The prevention buttons for 302/602 are enabled in production; unauthorized owner-refresh requests correctly return 403/no-store. B still needs owner-dashboard refresh wiring. The final verification report is in INTEGRATION_BUGS.md. No live model calls were made for this handoff, and A will not merge again.

## C fixes after handoff (authorized: C may fix packages/** and apps/web/src/app/api/**)

- **Day-14 recapture classification (31 Oct, C).** Root cause: `packages/ai/src/links/http.ts` upload built every non-meter
  resident observation as `kind: "check_result"`, but `packages/engine/src/recovery.ts` only treats `kind: "recapture"` as a
  post-repair recovery event, so a phone Day-14 recapture (Dry & Paint card → `ceiling_photo` link) never moved
  Repair/Dry/Paint or reopened a worsened case. Minimal fix in http.ts only: a `ceiling_photo` upload on a case that already
  has a `repair_done` observation is emitted as `kind: "recapture"` (rawText "Resident Day-14 recapture photo received");
  all other uploads unchanged. No contract, prompt, cache or engine change. Regression test:
  `packages/ai/test/links.test.ts` "C final: a ceiling photo after a recorded repair is a Day-14 recapture…" (worse photo →
  recapture → engine reopens, paint not ready). Note: in the hero fixtures `ceiling_photo@402` is excluded ("can't change
  the action"), so the Dry & Paint card offers the link only when the engine marks that check available.
- **Day-14 recapture link target (31 Oct, C).** Found in the production check: after "Record repair completed" the Dry &
  Paint card said "No recapture check is currently available from the engine" because `rankChecks` excluded the victim's
  `ceiling_photo` as "can't change the action" (a diagnostic rule). Minimal fix in `packages/engine/src/voi.ts`: once a
  `repair_done` exists and safety is ok, the victim ceiling photo is re-offered as a recovery link target with
  `excluded: null` and `score: 0` (same pattern as the prevention `inspect@flat` targets) until a recapture answers it after
  the repair. Score 0 means it never outranks diagnostic checks and never changes the stop rule; no repair exists in the
  frozen hard cases or simulator, so evaluation numbers are unchanged (verified: identical to v1). Regression test:
  `packages/engine/test/recapture-link.test.ts`.
