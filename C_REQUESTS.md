# Requests from C (eval / Judge Mode) to A and B

Out-of-scope changes C needs. C never edits these files; owners please pick up.

## To A
- [ ] **trades table (C-T01):** wc_connection component should map to plumber in tables/trades.ts — hard case p06 expects plumber.
- [ ] **root `pnpm eval` (C-T02):** root `package.json` has `"eval": "pnpm --filter @stacksense/engine eval"`, but the engine has no `eval` script, so `pnpm eval` fails. Please change it to
  `"eval": "pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts"`.
- [ ] **single-LLM baseline (C-T02):** `packages/ai/src/baseline/index.ts` is an empty stub. Please export
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
