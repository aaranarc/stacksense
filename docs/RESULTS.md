# StackSense — evaluation results

> **Team-built test, not field accuracy.** Generated 2026-10-31T05:20:25.855Z by `pnpm eval` from `eval/results/*.json`.
> Every number on the evaluation card comes from `apps/web/public/eval/latest.json`, written by this same run.

## Sets
- **30 hard cases** (`eval/hard-cases/`, frozen at tag `eval-frozen` before any results were seen; truths written from building physics, not from the engine's tables).
- **60 simulated buildings** (`simulateBuilding`, seeds 1–60; answers sampled from the simulator's true outcome model).
- **AI data:** 0 of 150 messages and 0 of 0 photos are human-labelled.

## Methods
1. **StackSense** — the engine the app uses: picks the check with the most expected information, Second Opinion applied (offline: labelled fallback, see below).
2. **Blame the flat above** — source = wet area of the flat directly above the victim, trade = waterproofer/tiler (terrace/roofer for a top-floor victim).
3. **Send a trade straight away** — the archetype's most likely family (prototype priors), its trade, no checks.
4. **Fixed checklist** — ceiling photo → duct photo → meter → trap photo, same engine posterior and stop rule, no information-gain choice.
5. **Single LLM, same evidence** — pending — 0/90 cases cached; run eval/runner/llm-baseline.ts (live LLM calls) to fill eval/runner/baseline-cache/.
6. **StackSense without Second Opinion** — ablation.

Answer loop: the method picks a check; the answer comes from the hard case's scripted steps or the simulator; stop when the engine stops or after 5 checks.
A check with no scripted answer in a hard case is skipped and the next-ranked check is tried (logged in `eval/results/engine-cases.json`).
A method that ends without a decision sends no trade, which is scored as "general inspector".

## What each metric means
- **Right trade** — the trade the method would send equals the case's true trade; on hazard cases only an emergency stop counts.
- **Top-1 after k checks** — the leading source after k answered checks is the true one (same family; same flat when both name one). Scored only on cases whose truth names a source (not hazard, not "inspect").
- **Over-claim** — the method commits to a trade but claims more than the evidence supports: any trade on an "inspect" case, an area/component claim on the wrong source, or a component claim without component-specific evidence.
- **Harmful flips** — number of single observations that turned a correct leader into a wrong one (count over all cases).
- **Checks to decision** — mean checks used by decided, non-emergency cases.
- **Hazard pass** — share of hazard cases that ended in an emergency stop (must be 100% for StackSense). n/a when a set has no hazard cases.
- **ms per case** — wall-clock time, this machine.

## Results — v2 (after A's stop-rule fix, made against the spec without opening the hard cases — no outcome changed on this test) — all 90 cases
| Method | Right trade | Top-1 after 1 check | Top-1 after 2 checks | Top-1 after 3 checks | Over-claim | Harmful flips | Checks to decision | Hazard pass | ms per case |
|---|---|---|---|---|---|---|---|---|---|
| StackSense | 46% | 79% | 83% | 83% | 1% | 2 | 0.67 | 100% | 0.23 |
| Blame the flat above | 31% | 36% | 36% | 36% | 63% | 0 **(loses)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Send a trade straight away | 18% | 21% | 21% | 21% | 7% | 0 **(loses)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Fixed checklist | 47% **(loses)** | 68% | 74% | 80% | 0% **(loses)** | 5 | 1.15 | 100% **(tie)** | 0.32 |
| StackSense without Second Opinion | 46% **(tie)** | 79% **(tie)** | 83% **(tie)** | 83% **(tie)** | 1% **(tie)** | 2 **(tie)** | 0.67 **(tie)** | 100% **(tie)** | 0.13 **(loses)** |

### Hard cases only (30)
| Method | Right trade | Top-1 after 1 check | Top-1 after 2 checks | Top-1 after 3 checks | Over-claim | Harmful flips | Checks to decision | Hazard pass | ms per case |
|---|---|---|---|---|---|---|---|---|---|
| StackSense | 67% | 81% | 86% | 86% | 0% | 0 | 0.84 | 100% | 0.29 |
| Blame the flat above | 23% | 38% | 38% | 38% | 60% | 0 **(tie)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Send a trade straight away | 20% | 33% | 33% | 33% | 17% | 0 **(tie)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Fixed checklist | 63% | 76% | 81% | 86% **(tie)** | 0% **(tie)** | 0 **(tie)** | 1.12 | 100% **(tie)** | 0.35 |
| StackSense without Second Opinion | 67% **(tie)** | 81% **(tie)** | 86% **(tie)** | 86% **(tie)** | 0% **(tie)** | 0 **(tie)** | 0.84 **(tie)** | 100% **(tie)** | 0.19 **(loses)** |

### Simulated buildings only (60)
| Method | Right trade | Top-1 after 1 check | Top-1 after 2 checks | Top-1 after 3 checks | Over-claim | Harmful flips | Checks to decision | Hazard pass | ms per case |
|---|---|---|---|---|---|---|---|---|---|
| StackSense | 35% | 78% | 81% | 81% | 2% | 2 | 0.6 | n/a | 0.2 |
| Blame the flat above | 35% **(tie)** | 36% | 36% | 36% | 65% | 0 **(loses)** | 0 **(loses)** | n/a | 0 **(loses)** |
| Send a trade straight away | 17% | 17% | 17% | 17% | 2% **(tie)** | 0 **(loses)** | 0 **(loses)** | n/a | 0 **(loses)** |
| Fixed checklist | 38% **(loses)** | 64% | 71% | 78% | 0% **(loses)** | 5 | 1.17 | n/a | 0.3 |
| StackSense without Second Opinion | 35% **(tie)** | 78% **(tie)** | 81% **(tie)** | 81% **(tie)** | 2% **(tie)** | 2 **(tie)** | 0.6 **(tie)** | n/a | 0.1 **(loses)** |

**(tie)** / **(loses)** mark metrics where StackSense ties or loses to that method.

## Every tie and loss
### All cases
- **Loss** vs *Blame the flat above* on **Harmful flips** (2 vs 0) — this method never updates, so it cannot flip; StackSense's leader moved right → wrong on probabilistic simulator answers (per case in engine-cases.json).
- **Loss** vs *Blame the flat above* on **Checks to decision** (0.67 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Blame the flat above* on **ms per case** (0.23 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Loss** vs *Send a trade straight away* on **Harmful flips** (2 vs 0) — this method never updates, so it cannot flip; StackSense's leader moved right → wrong on probabilistic simulator answers (per case in engine-cases.json).
- **Loss** vs *Send a trade straight away* on **Checks to decision** (0.67 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Send a trade straight away* on **ms per case** (0.23 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Loss** vs *Fixed checklist* on **Right trade** (46% vs 47%) — the fixed order asks more checks before the engine's stop rule fires; the extra evidence sometimes lifts the leader past the stop threshold, so it commits to a trade (right) where StackSense stopped at "inspect".
- **Loss** vs *Fixed checklist* on **Over-claim** (1% vs 0%) — StackSense committed at area level on a source that was wrong in at least one case where the checklist ended undecided.
- **Tie** vs *Fixed checklist* on **Hazard pass** (100% vs 100%) — both stop every hazard case (same engine safety gate).
- **Tie** vs *StackSense without Second Opinion* on **Right trade** (46% vs 46%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 1 check** (79% vs 79%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 2 checks** (83% vs 83%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 3 checks** (83% vs 83%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Over-claim** (1% vs 1%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Harmful flips** (2 vs 2) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Checks to decision** (0.67 vs 0.67) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Hazard pass** (100% vs 100%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Loss** vs *StackSense without Second Opinion* on **ms per case** (0.23 vs 0.13) — the fallback Second Opinion pass re-ranks checks once more per step; same decisions, a fraction of a millisecond slower.

### Hard cases
- **Tie** vs *Blame the flat above* on **Harmful flips** (0 vs 0) — neither method's leader was flipped from right to wrong by a single observation here.
- **Loss** vs *Blame the flat above* on **Checks to decision** (0.84 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Blame the flat above* on **ms per case** (0.29 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Tie** vs *Send a trade straight away* on **Harmful flips** (0 vs 0) — neither method's leader was flipped from right to wrong by a single observation here.
- **Loss** vs *Send a trade straight away* on **Checks to decision** (0.84 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Send a trade straight away* on **ms per case** (0.29 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Tie** vs *Fixed checklist* on **Top-1 after 3 checks** (86% vs 86%) — after three checks both have asked similar checks and share the same posterior.
- **Tie** vs *Fixed checklist* on **Over-claim** (0% vs 0%) — neither over-claimed on these cases.
- **Tie** vs *Fixed checklist* on **Harmful flips** (0 vs 0) — neither method's leader was flipped from right to wrong by a single observation here.
- **Tie** vs *Fixed checklist* on **Hazard pass** (100% vs 100%) — both stop every hazard case (same engine safety gate).
- **Tie** vs *StackSense without Second Opinion* on **Right trade** (67% vs 67%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 1 check** (81% vs 81%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 2 checks** (86% vs 86%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 3 checks** (86% vs 86%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Over-claim** (0% vs 0%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Harmful flips** (0 vs 0) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Checks to decision** (0.84 vs 0.84) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Hazard pass** (100% vs 100%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Loss** vs *StackSense without Second Opinion* on **ms per case** (0.29 vs 0.19) — the fallback Second Opinion pass re-ranks checks once more per step; same decisions, a fraction of a millisecond slower.

### Simulated buildings
- **Tie** vs *Blame the flat above* on **Right trade** (35% vs 35%) — StackSense's early "inspect" stops cost about as many right trades as this method gets right by default.
- **Loss** vs *Blame the flat above* on **Harmful flips** (2 vs 0) — this method never updates, so it cannot flip; StackSense's leader moved right → wrong on probabilistic simulator answers (per case in engine-cases.json).
- **Loss** vs *Blame the flat above* on **Checks to decision** (0.6 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Blame the flat above* on **ms per case** (0.2 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Tie** vs *Send a trade straight away* on **Over-claim** (2% vs 2%) — both over-claim on the same share of cases (often none).
- **Loss** vs *Send a trade straight away* on **Harmful flips** (2 vs 0) — this method never updates, so it cannot flip; StackSense's leader moved right → wrong on probabilistic simulator answers (per case in engine-cases.json).
- **Loss** vs *Send a trade straight away* on **Checks to decision** (0.6 vs 0) — this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.
- **Loss** vs *Send a trade straight away* on **ms per case** (0.2 vs 0) — this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.
- **Loss** vs *Fixed checklist* on **Right trade** (35% vs 38%) — the fixed order asks more checks before the engine's stop rule fires; the extra evidence sometimes lifts the leader past the stop threshold, so it commits to a trade (right) where StackSense stopped at "inspect".
- **Loss** vs *Fixed checklist* on **Over-claim** (2% vs 0%) — StackSense committed at area level on a source that was wrong in at least one case where the checklist ended undecided.
- **Tie** vs *StackSense without Second Opinion* on **Right trade** (35% vs 35%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 1 check** (78% vs 78%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 2 checks** (81% vs 81%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Top-1 after 3 checks** (81% vs 81%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Over-claim** (2% vs 2%) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Harmful flips** (2 vs 2) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Tie** vs *StackSense without Second Opinion* on **Checks to decision** (0.6 vs 0.6) — no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run.
- **Loss** vs *StackSense without Second Opinion* on **ms per case** (0.2 vs 0.1) — the fallback Second Opinion pass re-ranks checks once more per step; same decisions, a fraction of a millisecond slower.


## v1 (before stop-rule fix) — kept for honesty
Engine tree `42a624d3e20d5b3962c8cab55f456b2219d0e5f2`, generated 2026-10-31T04:35:35.748Z; the full file is `eval/results/engine-v1.json`.
The frozen-test run flagged early "inspect" stops while the leading source was already right. A traced a related stop-rule
bug — area and its localized component mass were not summed against the 0.80 threshold — and fixed it against the spec
without reading or running the hard cases (packages/engine/DECISIONS.md). On this test the fix changes **no outcome**: the
flagged misses take the separate, specified low-value path ("best check score < 0.05 → inspect"), which A kept unchanged.
Both runs use the same frozen cases and simulator seeds; only timing differs.

### v1 — all 90 cases
| Method | Right trade | Top-1 after 1 check | Top-1 after 2 checks | Top-1 after 3 checks | Over-claim | Harmful flips | Checks to decision | Hazard pass | ms per case |
|---|---|---|---|---|---|---|---|---|---|
| StackSense | 46% | 79% | 83% | 83% | 1% | 2 | 0.67 | 100% | 0.24 |
| Blame the flat above | 31% | 36% | 36% | 36% | 63% | 0 **(loses)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Send a trade straight away | 18% | 21% | 21% | 21% | 7% | 0 **(loses)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Fixed checklist | 47% **(loses)** | 68% | 74% | 80% | 0% **(loses)** | 5 | 1.15 | 100% **(tie)** | 0.32 |
| StackSense without Second Opinion | 46% **(tie)** | 79% **(tie)** | 83% **(tie)** | 83% **(tie)** | 1% **(tie)** | 2 **(tie)** | 0.67 **(tie)** | 100% **(tie)** | 0.14 **(loses)** |

### v1 — hard cases only
| Method | Right trade | Top-1 after 1 check | Top-1 after 2 checks | Top-1 after 3 checks | Over-claim | Harmful flips | Checks to decision | Hazard pass | ms per case |
|---|---|---|---|---|---|---|---|---|---|
| StackSense | 67% | 81% | 86% | 86% | 0% | 0 | 0.84 | 100% | 0.33 |
| Blame the flat above | 23% | 38% | 38% | 38% | 60% | 0 **(tie)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Send a trade straight away | 20% | 33% | 33% | 33% | 17% | 0 **(tie)** | 0 **(loses)** | 0% | 0 **(loses)** |
| Fixed checklist | 63% | 76% | 81% | 86% **(tie)** | 0% **(tie)** | 0 **(tie)** | 1.12 | 100% **(tie)** | 0.4 |
| StackSense without Second Opinion | 67% **(tie)** | 81% **(tie)** | 86% **(tie)** | 86% **(tie)** | 0% **(tie)** | 0 **(tie)** | 0.84 **(tie)** | 100% **(tie)** | 0.22 **(loses)** |

### v1 → v2, StackSense
| Set | Right trade v1 → v2 | Top-1 after 3 checks v1 → v2 | Over-claim v1 → v2 | Hazard pass v1 → v2 |
|---|---|---|---|---|
| all | 46% → 46% | 83% → 83% | 1% → 1% | 100% → 100% |
| hard | 67% → 67% | 86% → 86% | 0% → 0% | 100% → 100% |
| sim | 35% → 35% | 81% → 81% | 2% → 2% | n/a → n/a |

## Robustness — priors shifted
StackSense top-1 after 3 checks when the true family's prior is shifted (others at mode, re-normalised), applied through the engine's public `memory` option (exact: prior = (mode×10 + memory)/Σ).

| Prior shift | -40% | -20% | 0% | +20% | +40% | true family at archetype min | at max |
|---|---|---|---|---|---|---|---|
| Top-1 | 38% | 63% | 83% | 90% | 95% | 38% | 96% |

## AI reading
Pending — 0 of 150 messages and 0 of 0 photos are human-labelled so far. Unlabelled lines are skipped, never guessed. Run `pnpm --filter @stacksense/engine exec tsx ../../eval/runner/ai.ts` after labelling, then `pnpm eval`.

## Known limitations of this evaluation
- Team-built: the hard cases and simulator were written by the team; this is not field accuracy.
- Prototype priors, contractor review pending.
- The Second Opinion needs a live LLM; offline it is the labelled fallback, so its ablation ties.
- Hard cases script answers only for the checks their author anticipated; unscripted checks are skipped and logged.
- Prior sensitivity: StackSense top-1 after 3 checks is 83% at the prototype priors but 38% when the true family's prior is cut by 40% — the priors matter, which is why contractor review is pending.
- Most StackSense right-trade misses are the engine's own stop rule ("best check scores < 0.05 → inspect") firing after 0–1 checks while the leading source is already right. Reported to A; the engine was **not** tuned for this evaluation.

## Reproduce
```bash
pnpm i
pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts   # = pnpm eval once the root script points here
pnpm --filter @stacksense/engine exec vitest run --root ../../eval/runner
```
