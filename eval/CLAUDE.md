# C — evaluation, Judge Mode, README
Scope: eval/hard-cases/**, eval/runner/**, eval/results/**, eval/data/**, apps/web/public/eval/**,
apps/web/src/components/judge/**, docs/RESULTS.md, README.md, docs/plan/C_*.md.
Never edit packages/**, apps/web/src/app/api/**, other apps/web folders, eval/runner-ai/**, or root config.
If something outside scope must change, write the request to docs/internal/C_REQUESTS.md and tell the human.

- Engine and API only through @stacksense/engine and apps/web/src/lib/adapters.ts. Types from @stacksense/contracts.
- Never re-implement or tune engine logic to improve numbers. Ties and losses are reported, never hidden.
- Hard cases are frozen after tag eval-frozen: never edit eval/hard-cases/ after that tag.
- Every number shown to judges comes from eval/results/*.json produced by pnpm eval. Label: "team-built test, not field accuracy".
- UI: B's tokens and lib/visual.ts for colours; calm, text label on every colour; works at 390 px.
- Trust rules from docs/plan A10 apply (no "guilty", no money, hazard → emergency).
- After every task: pnpm -r typecheck && pnpm -r test && pnpm --filter web build;
  git add -A && git commit -m "[eval] <TASK-ID> <summary>" && git push origin c/help. Never push red.
