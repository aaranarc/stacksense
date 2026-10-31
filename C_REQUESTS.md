# Requests from C (eval / Judge Mode) to A and B

Out-of-scope changes C needs. C never edits these files; owners please pick up.

## To A
- [x] DONE by A (a/core, 31 Oct ~10:40) — **trades table (C-T01):** wc_connection component should map to plumber in tables/trades.ts — hard case p06 expects plumber.
- [x] DONE by A (a/core, 31 Oct ~10:40) — **root `pnpm eval` (C-T02):** root `package.json` has `"eval": "pnpm --filter @stacksense/engine eval"`, but the engine has no `eval` script, so `pnpm eval` fails. Please change it to
  `"eval": "pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts"`.
- [x] DONE by A (a/core, 31 Oct ~10:40) — **single-LLM baseline (C-T02):** `packages/ai/src/baseline/index.ts` is an empty stub. Please export
  `singleLlmBaseline(evidence) → { family, flatId|null, trade, level }` (prompt E.4, PROMPT_VERSION base-v1). Until then
  eval row 4 is reported as **pending** in `eval/results/engine.json` (`pending[]`), never as numbers.
- [ ] **FYI, not a request to tune (C-T02 finding):** most StackSense right-trade misses are the stop rule
  `best score < .05 → "Remote evidence can't decide — inspect"` firing after 0–1 checks while the leading source is
  already correct (e.g. hc-c02/c03/c04, hc-f03, hc-l01/l02/l05, hc-p04, hc-p06, most roof/condensation sims). Reported in
  RESULTS.md as a loss; per-case detail in `eval/results/engine-cases.json`. Your call whether it is intended.
- [ ] **FYI (C-T02):** hc-p05 asks `duct_photo@202`; 202's duct-wall report is a separate complaint (separate victim
  case), so it is not used as evidence for 302's case. Case ends undecided. Reported, not changed.
- [ ] **eval tests in CI (C-T02):** eval/ is outside the workspace, so `pnpm -r test` skips it. Optional root script:
  `"test:eval": "pnpm --filter @stacksense/engine exec vitest run --root ../../eval/runner && pnpm --filter @stacksense/engine exec tsc -p ../../eval/runner/tsconfig.json"`.

## To B
- [ ] **render the Judge panel (C-T04):** in `apps/web/src/components/Workspace.tsx` replace the inline
  `{judge&&<aside className="judge-panel panel" …>…</aside>}` with
  `{judge&&<JudgePanel state={state} onState={setState}/>}` and add
  `import { JudgePanel } from './judge/JudgePanel';`
- [ ] **WhatIfSliders (C-T04):** please export `WhatIfSliders({state,onState})` from
  `src/components/whatif/WhatIfSliders.tsx`. JudgePanel shows a labelled placeholder until it exists; C swaps one line.
- [ ] **c/help carries read-only copies of your files (C-T04):** `src/lib/adapters.ts`, `src/lib/visual.ts`,
  `src/mocks/{mockEngine,mockApi,browser}.ts`, `src/mocks/read-hero.json`, `src/mocks/states/*.json` — byte-identical to
  `origin/b/app` 5c3ddc3 (via `git show`), so the judge panel can import adapters. C never edits them; on any merge
  conflict take B's version.

## To A and B — BUILD BLOCKER FOR CP1 (found in C-T04)
- [x] DONE by A (a/core, 31 Oct ~10:40) — `main` + `b/app` merged locally does **not** build: b/app switched to `next build --webpack`, and webpack then
  bundles `sharp` (imported by `packages/ai/src/read/photos.ts` via `@stacksense/ai` in `/api/link`, `/api/memory`) →
  `Module not found: '@img/sharp-libvips-dev/include'`. Adding `serverExternalPackages: ['sharp']` to
  `apps/web/next.config.mjs` (B) is not enough on its own: `sharp` is then not resolvable from `apps/web` (pnpm strict)
  → `Could not load the "sharp" module`. Likely fix: B adds `serverExternalPackages: ['sharp']` **and** `sharp` as an
  `apps/web` dependency (or A moves sharp behind a server-only dynamic import). Please agree between you before CP1.
  C therefore did **not** merge `b/app` into `c/help`.
- [ ] **priorShift hook (C-T07, optional):** `createCase` has no `opts.priorShift`. C ran robustness exactly through the
  public `memory` option instead (prior = (mode×10 + memory)/Σ, so any target prior is reachable with memory ≥ 0;
  unit-tested in eval/runner/metrics.test.ts). An explicit `priorShift` would make this less indirect — not blocking.
- [ ] **FYI robustness (C-T07):** top-1 after 3 checks 83% at mode priors → 38% when the true family's prior is cut 40%
  (also at archetype min). Reported in RESULTS.md as a limitation.
- [x] DONE by A (a/core, 31 Oct ~10:40) — **docs/ai.md (C-T09):** README links `docs/ai.md` ("what is AI and what isn't") — A owns it; it does not exist yet.

## To B (C-T09)
- [ ] **README GIF + video link:** README shows `docs/demo.gif` (placeholder) — please add the GIF and the video link.

## To A (labelling, 10:00)
- [ ] **AI runner can't score "no observation":** `eval/runner-ai/run.ts` parses labels with `Observation.pick`, so
  zone/surface/kind are required. Noise lines (greetings, admin, questions — 41 of 150 drafted) can't be labelled
  "should produce nothing", so false-positive observations on noise are never measured. Optional: accept
  `labels: null` = "expect no observation" and count any predicted observation as FP. Until then C leaves noise lines out.

## To B (11:30, verified in the real app after merging b/app)
- [x] JudgePanel render line + WhatIfSliders — on b/app (867b502). C now embeds `WhatIfSliders` in JudgePanel (placeholder removed).
- [ ] **Hydration error (console, every load):** `CrossSection` renders `<title>{building.name} …</title>` with an
  array of children → "Hydration failed … server rendered HTML didn't match". Use a template string:
  `<title>{`${state.building.name} · building cross-section`}</title>`.
- [ ] **FYI:** `next dev` auto-appends a "nextjs-agent-rules" block to `apps/web/AGENTS.md`; C restored your committed
  version. `agentRules: false` in next.config stops it (A's/B's call — A owns the sharp config there).
- Verified at 1440 px and 390 px (emulated iPhone width): Judge Mode opens; hero Play → "Job Sheet: send waterproofer
  tiler"; what-if "502 meter → moved" → Job Sheet sends plumber; eval card shows label + tie/loses chips; 390 px = fixed
  bottom sheet (70vh, own scroll, 44 px "Hide panel" toggle, collapses to 78 px), tables scroll sideways, no page
  overflow; Break it "Electrical hazard" → emergency card, no check buttons.

## To A / human (12:00) — single-LLM baseline blocked
- [ ] Gemini returns **HTTP 429 "You exceeded your current quota, please check your plan and billing details"** for
  `gemini-3.8-flash` with the key in apps/web/.env.local (`gemini-2.5-flash` → 404, retired). 90/90 baseline calls failed;
  nothing was cached as an answer. Needs quota/billing raised (or a different key/provider). Then rerun:
  `pnpm --filter @stacksense/engine exec tsx --env-file="$PWD/apps/web/.env.local" ../../eval/runner/llm-baseline.ts && pnpm eval`.
  Note: the live app's /api/read and /api/second-opinion use the same key, so they are in labelled fallback until this is fixed.
