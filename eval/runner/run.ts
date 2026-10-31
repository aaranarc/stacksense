// C-T02 engine evaluation: StackSense vs 5 baselines on 30 frozen hard cases + 60 simulated buildings.
// Run: pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts
// Uses the same engine code the UI uses; never re-implements or tunes engine logic.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import {
  EvalResults, type Building, type EngineState, type Observation, type PhotoLabel, type RainSeries, type RankedCheck,
} from "../../packages/contracts/src/index";
import { createCase, applyObservations, applySecondOpinion, simulateBuilding } from "../../packages/engine/src/index";
// Read-only use of A's archetype priors for the "send a trade straight away" baseline (most common family).
import { archetypes, familyPriors, type Family } from "../../packages/engine/src/priors/archetypes";
import { loadHardCases } from "../hard-cases/validate";
import { aggregate, type Level, type Outcome, type Source, type Truth } from "./metrics";
import { merge } from "./merge";

export const LABEL = "team-built test, not field accuracy" as const;
export {MAX_CHECKS,FAMILY_TRADE,simCases,leader} from './caseRun';
export type {EvalCase,Trail} from './caseRun';
import {MAX_CHECKS,FAMILY_TRADE,simCases,leader,engineRun,voiChoice,fixedChoice,type EvalCase,type Trail} from './caseRun';

export function hardCases(): (() => EvalCase)[] {
  return loadHardCases().map((c) => () => {
    const pool = c.steps.filter((s) => s.every((o) => o.checkId));
    const used = new Set<number>();
    const inspect = c.truth.trade === "general_inspector";
    return {
      id: c.id, set: "hard", building: c.building, rain: c.rain, photoLabels: c.photoLabels,
      truth: { family: c.truth.family, flatId: c.truth.flatId, trade: c.truth.trade, emergency: c.truth.emergency, inspect },
      victimFlatId: c.steps[0]?.find((o) => o.kind === "complaint")?.flatId ?? null,
      timeline: c.steps.filter((s) => !s.some((o) => o.checkId)),
      answer(check) {
        const i = pool.findIndex((s, j) => !used.has(j) && s.every((o) => o.checkId === check.id));
        if (i < 0) return null;
        used.add(i);
        return pool[i]!;
      },
    };
  });
}

function blameAbove(c: EvalCase): Outcome {
  const t0 = performance.now();
  const victim = c.building.flats.find((f) => f.id === c.victimFlatId);
  const above = victim && c.building.flats.find((f) => f.floor === victim.floor + 1 && f.position === victim.position);
  const claim: Source = above ? { family: "upper_wet_area", flatId: above.id } : { family: "roof_terrace", flatId: null };
  return { caseId: c.id, set: c.set, truth: c.truth, leaders: [claim], trade: FAMILY_TRADE[claim.family]!, level: "area",
    claim, componentEvidence: false, checks: 0, decided: true, ms: performance.now() - t0 };
}

function tradeStraightAway(c: EvalCase): Outcome {
  const t0 = performance.now();
  const priors = familyPriors(c.building.archetype);
  const family = Object.entries(priors).sort((a, b) => b[1] - a[1])[0]![0];
  const claim: Source = { family, flatId: null };
  return { caseId: c.id, set: c.set, truth: c.truth, leaders: [claim], trade: FAMILY_TRADE[family]!, level: "mechanism",
    claim, componentEvidence: false, checks: 0, decided: true, ms: performance.now() - t0 };
}

export const LLM_METHOD = "Single LLM, same evidence";
export const CACHE_DIR = fileURLToPath(new URL("./baseline-cache/", import.meta.url));
export type CachedBaseline = { caseId: string; promptVersion: string; model: string; evidenceHash: string;
  result: { family: string; flatId: string | null; trade: string; emergency: boolean; level: "mechanism" | "area" } | null };
const cached = (id: string): CachedBaseline | null => existsSync(CACHE_DIR + id + ".json") ? JSON.parse(readFileSync(CACHE_DIR + id + ".json", "utf8")) : null;

/** Baseline 4 from the cache written by llm-baseline.ts (same evidence StackSense collected). null result = model unavailable → no trade. */
function singleLlm(c: EvalCase, t: Trail): Outcome {
  const s = engineRun(c, voiChoice, true, { unscripted: [], asked: [] }); // only for the evidence count
  const r = cached(c.id)!.result;
  const claim = r ? { family: r.family, flatId: r.flatId } : null;
  t.asked = [];
  return { caseId: c.id, set: c.set, truth: c.truth, leaders: [claim], checks: s.checks, ms: 0, componentEvidence: false,
    trade: !r ? "general_inspector" : r.emergency ? "emergency" : r.trade, level: r?.level ?? "mechanism", claim, decided: !!r };
}

export const METHODS: { name: string; run: (c: EvalCase, t: Trail) => Outcome }[] = [
  { name: "StackSense", run: (c, t) => engineRun(c, voiChoice, true, t) },
  { name: "Blame the flat above", run: (c) => blameAbove(c) },
  { name: "Send a trade straight away", run: (c) => tradeStraightAway(c) },
  { name: "Fixed checklist", run: (c, t) => engineRun(c, fixedChoice, true, t) },
  { name: "StackSense without Second Opinion", run: (c, t) => engineRun(c, voiChoice, false, t) },
];
export type Shift = number | "min" | "max";
/**
 * Memory counts that make the engine's prior equal the target: the true family's prior × (1 + pct/100)
 * (or set to the archetype min/max), others at mode, re-normalised. Engine prior = (mode×10 + memory)/Σ, so with
 * m_f = K·q_f − 10·mode_f and K = max(10·mode_f / q_f) every m_f ≥ 0 and the prior is exactly q.
 */
export function shiftMemory(archetype: Building["archetype"], family: Family, shift: Shift): Record<Family, number> {
  const ranges = archetypes[archetype];
  const fams = Object.keys(ranges) as Family[];
  const raw = Object.fromEntries(fams.map((f) => [f, f !== family ? ranges[f].mode
    : shift === "min" ? ranges[f].min : shift === "max" ? ranges[f].max : ranges[f].mode * (1 + shift / 100)])) as Record<Family, number>;
  const total = fams.reduce((a, f) => a + raw[f], 0);
  const q = Object.fromEntries(fams.map((f) => [f, raw[f] / total])) as Record<Family, number>;
  const K = Math.max(...fams.map((f) => (10 * ranges[f].mode) / q[f]));
  return Object.fromEntries(fams.map((f) => [f, Math.max(0, K * q[f] - 10 * ranges[f].mode)])) as Record<Family, number>;
}

export const SHIFTS = [-40, -20, 0, 20, 40] as const;
/** StackSense top-1 after 3 checks with shifted priors (scored cases only: not hazard, not inspect). */
function robustnessRun(factories: (() => EvalCase)[], shift: Shift): number {
  const outs = factories.map((make) => {
    const c = make();
    if (!c.truth.emergency && !c.truth.inspect) c.memory = shiftMemory(c.building.archetype, c.truth.family as Family, shift);
    return METHODS[0]!.run(c, { unscripted: [], asked: [] });
  });
  return aggregate("StackSense", outs).top1[2]!;
}


/** Git tree hash of packages/engine (working copy included) — tells v1 and v2 runs apart. */
function engineTree(): string {
  try { return execSync("git rev-parse HEAD:packages/engine", { encoding: "utf8" }).trim() + (execSync("git status --porcelain -- packages/engine", { encoding: "utf8" }).trim() ? "+dirty" : ""); }
  catch { return "unknown"; }
}

export function evaluate(opts: { sims?: number } = {}) {
  const factories = [...hardCases(), ...simCases(opts.sims ?? 60)];
  // Baseline 4 runs on the 30 hard cases only (free-tier quota); its row appears in the hard-case table when complete.
  const hardIds = factories.map((f) => f()).filter((c) => c.set === "hard").map((c) => c.id);
  const have = hardIds.filter((id) => cached(id)).length, llmReady = hardIds.length > 0 && have === hardIds.length;
  const methods = METHODS;
  const pending = [{ method: LLM_METHOD, reason: llmReady
    ? "hard cases only (free-tier AI quota) — see the hard-case table; not run on simulated buildings"
    : have > 0 ? `partial — ${have} of ${hardIds.length} (free-tier quota); not scored until all ${hardIds.length} hard cases are answered`
      : `pending — free-tier quota; rerun LIVE_LLM_TESTS=1 eval/runner/llm-baseline.ts` }];
  const robustness = SHIFTS.map((p) => ({ priorShiftPct: p, top1: robustnessRun(factories, p) }));
  const robustnessArchetype = (["min", "max"] as const).map((at) => ({ trueFamilyPriorAt: at, top1: robustnessRun(factories, at) }));
  const outcomes: Record<string, Outcome[]> = {}, trails: Record<string, Record<string, Trail>> = {};
  for (const m of methods) {
    outcomes[m.name] = []; trails[m.name] = {};
    for (const make of factories) {
      const c = make(), trail: Trail = { unscripted: [], asked: [] };
      outcomes[m.name]!.push(m.run(c, trail));
      trails[m.name]![c.id] = trail;
    }
  }
  const rowsFor = (set?: "hard" | "sim") => methods.map((m) => aggregate(m.name, outcomes[m.name]!.filter((o) => !set || o.set === set)));
  const hardRows = () => {
    const rows = rowsFor("hard");
    if (!llmReady) return rows;
    const llm = factories.map((f) => f()).filter((c) => c.set === "hard").map((c) => singleLlm(c, { unscripted: [], asked: [] }));
    return [...rows.slice(0, 4), aggregate(LLM_METHOD, llm), ...rows.slice(4)];
  };
  const results = {
    generatedAt: new Date().toISOString(), label: LABEL,
    sets: { simBuildings: opts.sims ?? 60, hardCases: factories.length - (opts.sims ?? 60), photos: 0, messages: 0 },
    rows: rowsFor(), robustness, ai: null,
    robustnessArchetype,
    rowsBySet: { hard: hardRows(), sim: rowsFor("sim") },
    pending,
    engineTree: engineTree(),
  };
  EvalResults.parse(results); // contract check (extra keys are additive)
  return { results, outcomes, trails };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { results, outcomes, trails } = evaluate();
  const out = fileURLToPath(new URL("../results/", import.meta.url));
  mkdirSync(out, { recursive: true });
  writeFileSync(out + "engine.json", JSON.stringify(results, null, 2) + "\n");
  const perCase = Object.fromEntries(Object.entries(outcomes).map(([m, os]) => [m, os.map((o) => ({
    id: o.caseId, truth: `${o.truth.family}${o.truth.flatId ? "@" + o.truth.flatId : ""} → ${o.truth.emergency ? "emergency" : o.truth.trade}`,
    trade: o.trade, level: o.level, leader: o.claim ? `${o.claim.family}${o.claim.flatId ? "@" + o.claim.flatId : ""}` : null,
    checks: o.checks, decided: o.decided, asked: trails[m]![o.caseId]!.asked, unscripted: trails[m]![o.caseId]!.unscripted,
  }))]));
  writeFileSync(out + "engine-cases.json", JSON.stringify(perCase, null, 1) + "\n");
  for (const [name, rows] of [["ALL (30 hard + 60 sim)", results.rows], ["HARD CASES (30)", results.rowsBySet.hard], ["SIMULATED (60)", results.rowsBySet.sim]] as const) {
    console.log(`\n${name} — ${LABEL}`);
    console.table(rows.map((r) => ({ ...r, top1: r.top1.join(" / ") })));
  }
  console.log("pending:", results.pending.map((p) => `${p.method}: ${p.reason}`).join("; "));
  const failing = outcomes["StackSense"]!.filter((o) => o.truth.emergency && o.trade !== "emergency").map((o) => o.caseId);
  console.log(failing.length ? `HAZARD FAIL: ${failing.join(", ")}` : "hazard pass: all hazard cases ended in emergency");
  console.log("robustness:", results.robustness.map((r) => `${r.priorShiftPct}%→${r.top1}`).join("  "), results.robustnessArchetype.map((r) => `${r.trueFamilyPriorAt}→${r.top1}`).join("  "));
  merge();
  console.log("wrote eval/results/engine.json, apps/web/public/eval/latest.json, docs/RESULTS.md");
}
