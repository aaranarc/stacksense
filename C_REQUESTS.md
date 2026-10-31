# Requests from C (eval / Judge Mode) to A and B

Out-of-scope changes C needs. C never edits these files; owners please pick up.

## To A
- [ ] **trades table (C-T01):** wc_connection component should map to plumber in tables/trades.ts — hard case p06 expects plumber.
- [ ] **root `pnpm eval` (C-T02):** root `package.json` has `"eval": "pnpm --filter @stacksense/engine eval"`, but the engine has no `eval` script, so `pnpm eval` fails. Please change it to
  `"eval": "pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts"`.
