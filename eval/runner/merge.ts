// C-T07 merge: eval/results/engine.json (+ ai.json if human-labelled) → apps/web/public/eval/latest.json + docs/RESULTS.md.
// Called at the end of run.ts; can also run alone: pnpm --filter @stacksense/engine exec tsx ../../eval/runner/merge.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { EvalResults } from "../../packages/contracts/src/index";
import type { EvalRow } from "./metrics";
import { prepare } from "./ai";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));
type Engine = EvalResults & { rowsBySet: { hard: EvalRow[]; sim: EvalRow[] }; pending: { method: string; reason: string }[];
  robustnessArchetype: { trueFamilyPriorAt: string; top1: number }[] };

const METRICS: { key: string; label: string; get: (r: EvalRow) => number | null; higher: boolean; pct: boolean }[] = [
  { key: "rightTrade", label: "Right trade", get: (r) => r.rightTrade, higher: true, pct: true },
  { key: "top1-1", label: "Top-1 after 1 check", get: (r) => r.top1[0] ?? null, higher: true, pct: true },
  { key: "top1-2", label: "Top-1 after 2 checks", get: (r) => r.top1[1] ?? null, higher: true, pct: true },
  { key: "top1-3", label: "Top-1 after 3 checks", get: (r) => r.top1[2] ?? null, higher: true, pct: true },
  { key: "overclaim", label: "Over-claim", get: (r) => r.overclaim, higher: false, pct: true },
  { key: "harmfulFlips", label: "Harmful flips", get: (r) => r.harmfulFlips, higher: false, pct: false },
  { key: "checksToDecision", label: "Checks to decision", get: (r) => r.checksToDecision, higher: false, pct: false },
  { key: "hazardPass", label: "Hazard pass", get: (r) => r.hazardPass, higher: true, pct: true },
  { key: "msPerCase", label: "ms per case", get: (r) => r.msPerCase, higher: false, pct: false },
];
const fmt = (x: number | null, pct: boolean) => (x === null || Number.isNaN(x) ? "n/a" : pct ? `${Math.round(x * 100)}%` : String(Math.round(x * 100) / 100));
export function verdict(ours: number | null, theirs: number | null, higher: boolean): "tie" | "loses" | null {
  if (ours === null || theirs === null || Number.isNaN(ours) || Number.isNaN(theirs)) return null;
  if (ours === theirs) return "tie";
  return (higher ? ours < theirs : ours > theirs) ? "loses" : null;
}

// One line on why, per metric, with method-specific overrides.
const WHY: Record<string, string> = {
  rightTrade: "StackSense's stop rule often ends with \"inspect\" (no trade) after 0–1 checks even when its leading source is right; a method that commits to the leader's trade scores higher whenever that leader is right.",
  "top1-1": "after one check both methods have seen nearly the same evidence and use the same engine posterior.",
  "top1-2": "after two checks both methods have seen nearly the same evidence and use the same engine posterior.",
  "top1-3": "after three checks the evidence sets converge, so the shared engine posterior names the same leader.",
  "rightTrade:tie": "StackSense's early \"inspect\" stops cost about as many right trades as this method gets right by default.",
  overclaim: "this method rarely commits at area/component level, so it has fewer chances to over-claim.",
  "overclaim:tie": "both over-claim on the same share of cases (often none).",
  harmfulFlips: "neither method's leader was flipped from right to wrong by a single observation here.",
  "harmfulFlips:loses": "this method never updates, so it cannot flip; StackSense's leader moved right → wrong on probabilistic simulator answers (per case in engine-cases.json).",
  checksToDecision: "this method decides without (or with fewer) checks — it never looks at evidence, which is the cost being measured, not an advantage.",
  hazardPass: "both stop every hazard case (same engine safety gate).",
  msPerCase: "this method does no inference (a fixed rule), so it is faster; StackSense still answers in about a millisecond.",
};
const WHY_BY_METHOD: Record<string, Partial<Record<string, string>>> = {
  "StackSense without Second Opinion": { ...Object.fromEntries(METRICS.map((m) => [m.key,
    "no live LLM runs in the offline eval, so the Second Opinion is the labelled fallback (review_failed), which never changes the posterior, check choice or trade — the ablation ties by construction; measuring its effect needs a live run."])),
    "msPerCase:loses": "the fallback Second Opinion pass re-ranks checks once more per step; same decisions, a fraction of a millisecond slower." } as Partial<Record<string, string>>,
  "Fixed checklist": {
    "overclaim:tie": "neither over-claimed on these cases.",
    rightTrade: "the fixed order asks more checks before the engine's stop rule fires; the extra evidence sometimes lifts the leader past the stop threshold, so it commits to a trade (right) where StackSense stopped at \"inspect\".",
    overclaim: "StackSense committed at area level on a source that was wrong in at least one case where the checklist ended undecided.",
    "top1-3": "after three checks both have asked similar checks and share the same posterior.",
  },
  "Blame the flat above": { overclaim: "blaming the flat above commits at area level every time; where StackSense loses here it named a wrong area at least once more often." },
};

function table(rows: EvalRow[]): string {
  const ours = rows.find((r) => r.method === "StackSense");
  const head = `| Method | ${METRICS.map((m) => m.label).join(" | ")} |\n|---|${METRICS.map(() => "---").join("|")}|`;
  const body = [ours, ...rows.filter((r) => r !== ours)].filter(Boolean).map((r) => `| ${r!.method} | ${METRICS.map((m) => {
    const v = r === ours || !ours ? null : verdict(m.get(ours), m.get(r!), m.higher);
    return fmt(m.get(r!), m.pct) + (v ? ` **(${v})**` : "");
  }).join(" | ")} |`);
  return [head, ...body].join("\n");
}

export function tiesAndLosses(rows: EvalRow[]): string[] {
  const ours = rows.find((r) => r.method === "StackSense");
  if (!ours) return [];
  return rows.filter((r) => r !== ours).flatMap((r) => METRICS.flatMap((m) => {
    const v = verdict(m.get(ours), m.get(r), m.higher);
    if (!v) return [];
    const own = WHY_BY_METHOD[r.method];
    const why = own?.[`${m.key}:${v}`] ?? own?.[m.key] ?? WHY[`${m.key}:${v}`] ?? WHY[m.key];
    return [`- **${v === "tie" ? "Tie" : "Loss"}** vs *${r.method}* on **${m.label}** (${fmt(m.get(ours), m.pct)} vs ${fmt(m.get(r), m.pct)}) — ${why}`];
  }));
}

export function merge() {
  const engine = JSON.parse(readFileSync(at("../results/engine.json"), "utf8")) as Engine;
  const data = prepare();
  let ai: EvalResults["ai"] = null, aiRaw: Record<string, unknown> | null = null;
  if (existsSync(at("../results/ai.json"))) {
    aiRaw = JSON.parse(readFileSync(at("../results/ai.json"), "utf8"));
    const r = aiRaw as { humanReviewed?: boolean; placeholder?: boolean; photoAccuracy?: number | null; cleanWallFalsePositive?: number | null;
      f1ByField?: Record<string, number | null>; f1ByLanguage?: Record<string, number | null>; meanCostPerCaseUsd?: number | null };
    const clean = (o: Record<string, number | null> = {}) => Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === "number")) as Record<string, number>;
    if (r.humanReviewed && !r.placeholder && typeof r.photoAccuracy === "number" && typeof r.cleanWallFalsePositive === "number" && typeof r.meanCostPerCaseUsd === "number") {
      ai = { photoAccuracy: r.photoAccuracy, cleanWallFalsePositive: r.cleanWallFalsePositive, f1ByField: clean(r.f1ByField), f1ByLanguage: clean(r.f1ByLanguage), costPerCaseUsd: r.meanCostPerCaseUsd };
    }
  }
  const latest = { ...engine, generatedAt: new Date().toISOString(), ai, aiRaw,
    sets: { ...engine.sets, photos: ai ? data.photos.length : 0, messages: ai ? data.messages.length : 0 } };
  EvalResults.parse(latest);
  mkdirSync(at("../../apps/web/public/eval/"), { recursive: true });
  writeFileSync(at("../../apps/web/public/eval/latest.json"), JSON.stringify(latest, null, 2) + "\n");
  writeFileSync(at("../../docs/RESULTS.md"), resultsMd(latest, data));
  return latest;
}

function resultsMd(r: Engine & { ai: EvalResults["ai"]; aiRaw: unknown }, data: ReturnType<typeof prepare>): string {
  const sets = r.sets, all = tiesAndLosses(r.rows), hard = tiesAndLosses(r.rowsBySet.hard), sim = tiesAndLosses(r.rowsBySet.sim);
  return `# StackSense — evaluation results

> **Team-built test, not field accuracy.** Generated ${r.generatedAt} by \`pnpm eval\` from \`eval/results/*.json\`.
> Every number on the evaluation card comes from \`apps/web/public/eval/latest.json\`, written by this same run.

## Sets
- **${sets.hardCases} hard cases** (\`eval/hard-cases/\`, frozen at tag \`eval-frozen\` before any results were seen; truths written from building physics, not from the engine's tables).
- **${sets.simBuildings} simulated buildings** (\`simulateBuilding\`, seeds 1–${sets.simBuildings}; answers sampled from the simulator's true outcome model).
- **AI data:** ${data.messages.length} of ${data.total} messages and ${data.photos.length} of ${data.photoTotal} photos are human-labelled.

## Methods
1. **StackSense** — the engine the app uses: picks the check with the most expected information, Second Opinion applied (offline: labelled fallback, see below).
2. **Blame the flat above** — source = wet area of the flat directly above the victim, trade = waterproofer/tiler (terrace/roofer for a top-floor victim).
3. **Send a trade straight away** — the archetype's most likely family (prototype priors), its trade, no checks.
4. **Fixed checklist** — ceiling photo → duct photo → meter → trap photo, same engine posterior and stop rule, no information-gain choice.
5. **Single LLM, same evidence** — ${r.pending.map((p) => p.reason).join("; ") || "run"}.
6. **StackSense without Second Opinion** — ablation.

Answer loop: the method picks a check; the answer comes from the hard case's scripted steps or the simulator; stop when the engine stops or after 5 checks.
A check with no scripted answer in a hard case is skipped and the next-ranked check is tried (logged in \`eval/results/engine-cases.json\`).
A method that ends without a decision sends no trade, which is scored as "general inspector".

## What each metric means
- **Right trade** — the trade the method would send equals the case's true trade; on hazard cases only an emergency stop counts.
- **Top-1 after k checks** — the leading source after k answered checks is the true one (same family; same flat when both name one). Scored only on cases whose truth names a source (not hazard, not "inspect").
- **Over-claim** — the method commits to a trade but claims more than the evidence supports: any trade on an "inspect" case, an area/component claim on the wrong source, or a component claim without component-specific evidence.
- **Harmful flips** — number of single observations that turned a correct leader into a wrong one (count over all cases).
- **Checks to decision** — mean checks used by decided, non-emergency cases.
- **Hazard pass** — share of hazard cases that ended in an emergency stop (must be 100% for StackSense). n/a when a set has no hazard cases.
- **ms per case** — wall-clock time, this machine.

## Results — all ${sets.hardCases + sets.simBuildings} cases
${table(r.rows)}

### Hard cases only (${sets.hardCases})
${table(r.rowsBySet.hard)}

### Simulated buildings only (${sets.simBuildings})
${table(r.rowsBySet.sim)}

**(tie)** / **(loses)** mark metrics where StackSense ties or loses to that method.

## Every tie and loss
### All cases
${all.join("\n") || "- none"}

### Hard cases
${hard.join("\n") || "- none"}

### Simulated buildings
${sim.join("\n") || "- none"}

## Robustness — priors shifted
StackSense top-1 after 3 checks when the true family's prior is shifted (others at mode, re-normalised), applied through the engine's public \`memory\` option (exact: prior = (mode×10 + memory)/Σ).

| Prior shift | ${r.robustness.map((x) => `${x.priorShiftPct > 0 ? "+" : ""}${x.priorShiftPct}%`).join(" | ")} | true family at archetype min | at max |
|---|${r.robustness.map(() => "---").join("|")}|---|---|
| Top-1 | ${r.robustness.map((x) => fmt(x.top1, true)).join(" | ")} | ${fmt(r.robustnessArchetype.find((x) => x.trueFamilyPriorAt === "min")?.top1 ?? null, true)} | ${fmt(r.robustnessArchetype.find((x) => x.trueFamilyPriorAt === "max")?.top1 ?? null, true)} |

## AI reading
${r.ai ? `- Photo surface accuracy ${fmt(r.ai.photoAccuracy, true)} · clean-wall false-positive rate ${fmt(r.ai.cleanWallFalsePositive, true)} · mean cost per case $${r.ai.costPerCaseUsd.toFixed(4)}
- F1 by field: ${Object.entries(r.ai.f1ByField).map(([k, v]) => `${k} ${fmt(v, true)}`).join(" · ")}
- F1 by language: ${Object.entries(r.ai.f1ByLanguage).map(([k, v]) => `${k} ${fmt(v, true)}`).join(" · ")}`
  : `Pending — ${data.messages.length} of ${data.total} messages and ${data.photos.length} of ${data.photoTotal} photos are human-labelled so far. Unlabelled lines are skipped, never guessed. Run \`pnpm --filter @stacksense/engine exec tsx ../../eval/runner/ai.ts\` after labelling, then \`pnpm eval\`.`}

## Known limitations of this evaluation
- Team-built: the hard cases and simulator were written by the team; this is not field accuracy.
- Prototype priors, contractor review pending.
- The Second Opinion needs a live LLM; offline it is the labelled fallback, so its ablation ties.
- Hard cases script answers only for the checks their author anticipated; unscripted checks are skipped and logged.
- Prior sensitivity: StackSense top-1 after 3 checks is ${fmt(r.robustness.find((x) => x.priorShiftPct === 0)?.top1 ?? null, true)} at the prototype priors but ${fmt(r.robustness.find((x) => x.priorShiftPct === -40)?.top1 ?? null, true)} when the true family's prior is cut by 40% — the priors matter, which is why contractor review is pending.
- Most StackSense right-trade misses are the engine's own stop rule (\"best check scores < 0.05 → inspect\") firing after 0–1 checks while the leading source is already right. Reported to A; the engine was **not** tuned for this evaluation.

## Reproduce
\`\`\`bash
pnpm i
pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts   # = pnpm eval once the root script points here
pnpm --filter @stacksense/engine exec vitest run --root ../../eval/runner
\`\`\`
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) { merge(); console.log("wrote apps/web/public/eval/latest.json and docs/RESULTS.md"); }
