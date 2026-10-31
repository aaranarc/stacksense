# StackSense — rules for every coding agent

Plans: docs/plan/A_CORE_Codex_Mac.md (person A) and docs/plan/B_APP_Codex_Windows.md (person B).
Read the plan of the person running you before any task. Do tasks exactly as specified, in order.

Ownership (never edit outside your owner's folders):
- A: root config, packages/**, apps/web/src/app/api/**, apps/web/public/eval/**, fixtures/**, fixtures-ai/**,
  eval/data/**, eval/runner/**, eval/runner-ai/**, eval/results/**, docs/*.md (not docs/plan), README.md text.
- B: everything else in apps/web/** (incl. src/app/c/[token]/**), eval/hard-cases/**.
- Shared contract: packages/contracts/src/index.ts — additive optional fields only, by A only.

Iron rule: the AI only READS (chat/photos → schema labels) and DRAFTS the Second Opinion.
Odds, check choice, safety, trade and statuses are deterministic engine code (packages/engine).

Trust rules: "probable source", never "guilty flat"; who pays = links only; a photo cannot measure
moisture (paint ready needs a moisture reading); no invented money; no meter check without a meter;
prevention = inspection first; no AI self-confidence thresholds; AI down → labelled fallback, never fake;
pseudonymise + strip EXIF before any network call; unanswered hazard = incomplete, never safe.

After EVERY task:
  pnpm -r typecheck && pnpm -r test   (B also: pnpm --filter web build)
  if green: git add -A && git commit -m "[core|app] <TASK-ID> <summary>" && git push origin <your-branch>
  if red: fix, never push red. Never commit .env*, keys, real names or phone numbers. Never force-push.
If something you need from the other person is missing: use the mock described in the plan and continue.
Ask the human only for secrets, accounts, or a decision the plan does not cover.

## Final A handoff authority (user instruction, 31 October 2026)
After A's single final a/core-only handoff merge, C (person C, Claude Code) is the sole merger to main. C is also authorized to fix bugs in packages/** and apps/web/src/app/api/**. This supersedes the plan's older A-only merge/bug-fix ownership for those folders. B retains other app ownership except C's components/judge/**. Keep contracts, trust rules, green-check gates and no-force-push rules. See docs/HANDOFF_A.md. A must not merge again after this handoff.
