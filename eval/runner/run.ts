// C-T02 engine evaluation: StackSense vs 5 baselines on 30 frozen hard cases + 60 simulated buildings.
// Run: pnpm --filter @stacksense/engine exec tsx ../../eval/runner/run.ts
// Uses the same engine code the UI uses; never re-implements or tunes engine logic.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import {
  EvalResults, type Building, type EngineState, type Observation, type PhotoLabel, type RainSeries, type RankedCheck,
} from "../../packages/contracts/src/index";
import { createCase, applyObservations, applySecondOpinion, simulateBuilding } from "../../packages/engine/src/index";
// Read-only use of A's archetype priors for the "send a trade straight away" baseline (most common family).
import { familyPriors } from "../../packages/engine/src/priors/archetypes";
import { loadHardCases } from "../hard-cases/validate";
import { aggregate, type Level, type Outcome, type Source, type Truth } from "./metrics";

export const LABEL = "team-built test, not field accuracy" as const;
export const MAX_CHECKS = 5;
// Trade per source family as written in the plan (A-T16); used for sim truths and the no-check baselines.
export const FAMILY_TRADE: Record<string, string> = {
  upper_wet_area: "waterproofer_tiler", upper_supply: "plumber", shared_shaft: "plumber",
  facade_window: "facade_sealant", roof_terrace: "roofer", condensation: "ventilation", other: "general_inspector",
};
const FIXED_ORDER = ["ceiling_photo", "duct_photo", "meter_check", "trap_grout_photo"];

export type EvalCase = {
  id: string; set: "hard" | "sim"; building: Building; truth: Truth; victimFlatId: string | null;
  timeline: Observation[][]; rain?: RainSeries; photoLabels?: PhotoLabel[];
  /** Answer to a requested check, or null when this case holds no answer for it. Stateful per instance. */
  answer(check: RankedCheck): Observation[] | null;
};

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

export function simCases(n: number): (() => EvalCase)[] {
  return Array.from({ length: n }, (_, i) => () => {
    const seed = i + 1, sim = simulateBuilding(seed);
    const family = sim.truth.family;
    return {
      id: `sim-${seed}`, set: "sim", building: sim.building, victimFlatId: sim.victimFlatId,
      truth: { family, flatId: sim.truth.flatId, trade: FAMILY_TRADE[family]!, emergency: false, inspect: family === "other" },
      timeline: [[sim.initialObservation]],
      answer(check) { try { return [sim.answer(check)]; } catch { return null; } },
    };
  });
}

/** Leading root hypothesis by total mass (root + its components). */
export function leader(s: EngineState): Source | null {
  const roots = s.hypotheses.filter((h) => !h.parentId);
  const mass = (id: string) => (s.posterior[id] ?? 0) + s.hypotheses.filter((h) => h.parentId === id).reduce((a, h) => a + (s.posterior[h.id] ?? 0), 0);
  const top = [...roots].sort((a, b) => mass(b.id) - mass(a.id))[0];
  return top ? { family: top.family, flatId: top.flatId } : null;
}

const componentEvidence = (obs: Observation[], labels: PhotoLabel[]) => obs.some((o) => {
  const bad = labels.some((l) => o.photoIds.includes(l.photoId) && l.quality !== "ok");
  if (o.finding?.component) return true;
  if (o.zone === "trap_grout" && o.surface === "crack" && !bad) return true;
  return !!o.checkId?.startsWith("dye_test@") && (o.surface === "damp_stain" || /appeared|reached/i.test(o.rawText));
});

type Chooser = (s: EngineState, asked: Set<string>) => RankedCheck[];
const voiChoice: Chooser = (s) => s.nextChecks.filter((c) => c.excluded === null).sort((a, b) => b.score - a.score);
const fixedChoice: Chooser = (s, asked) => s.nextChecks
  .filter((c) => (c.excluded === null || c.excluded === "can't change the action") && FIXED_ORDER.includes(c.type) && !asked.has(c.id))
  .sort((a, b) => FIXED_ORDER.indexOf(a.type) - FIXED_ORDER.indexOf(b.type));

export type Trail = { unscripted: string[]; asked: string[] };

/** Answer loop shared by the engine-driven methods. */
function engineRun(c: EvalCase, choose: Chooser, review: boolean, trail: Trail): Outcome {
  const t0 = performance.now();
  const ctx = { rain: c.rain, photoLabels: c.photoLabels };
  const reviewed = (s: EngineState) => (review ? applySecondOpinion(s, null) : s); // no live LLM in eval → labelled fallback
  let s: EngineState = createCase(c.building, { now: c.timeline[0]![0]!.at });
  for (const step of c.timeline) s = applyObservations(s, step, ctx);
  s = reviewed(s);
  const leaders = [leader(s)], collected = c.timeline.flat(), asked = new Set<string>();
  while (leaders.length - 1 < MAX_CHECKS && !s.stop.stopped) {
    let answered = false;
    for (const check of choose(s, asked)) {
      const ans = c.answer(check);
      if (!ans) { trail.unscripted.push(check.id); continue; }
      s = reviewed(applyObservations(s, ans, ctx));
      collected.push(...ans); asked.add(check.id); trail.asked.push(check.id);
      leaders.push(leader(s)); answered = true;
      break;
    }
    if (!answered) break;
  }
  const checks = leaders.length - 1, ms = performance.now() - t0;
  const base = { caseId: c.id, set: c.set, truth: c.truth, leaders, checks, ms,
    componentEvidence: componentEvidence(collected, c.photoLabels ?? []) };
  if (s.safety.status === "emergency") return { ...base, trade: "emergency", level: "mechanism", claim: null, decided: true };
  if (s.jobSheet) return { ...base, trade: s.jobSheet.send[0]?.trade ?? "general_inspector", level: s.jobSheet.level as Level, claim: leader(s), decided: true };
  return { ...base, trade: "general_inspector", level: "mechanism", claim: null, decided: false };
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

export const METHODS: { name: string; run: (c: EvalCase, t: Trail) => Outcome }[] = [
  { name: "StackSense", run: (c, t) => engineRun(c, voiChoice, true, t) },
  { name: "Blame the flat above", run: (c) => blameAbove(c) },
  { name: "Send a trade straight away", run: (c) => tradeStraightAway(c) },
  { name: "Fixed checklist", run: (c, t) => engineRun(c, fixedChoice, true, t) },
  { name: "StackSense without Second Opinion", run: (c, t) => engineRun(c, voiChoice, false, t) },
];
export const PENDING = [{
  method: "Single LLM, same evidence",
  reason: "pending — singleLlmBaseline is not exported by @stacksense/ai yet (requested from A in C_REQUESTS.md)",
}];

export function evaluate(opts: { sims?: number; robustness?: { priorShiftPct: number; top1: number }[] } = {}) {
  const factories = [...hardCases(), ...simCases(opts.sims ?? 60)];
  const outcomes: Record<string, Outcome[]> = {}, trails: Record<string, Record<string, Trail>> = {};
  for (const m of METHODS) {
    outcomes[m.name] = []; trails[m.name] = {};
    for (const make of factories) {
      const c = make(), trail: Trail = { unscripted: [], asked: [] };
      outcomes[m.name]!.push(m.run(c, trail));
      trails[m.name]![c.id] = trail;
    }
  }
  const rowsFor = (set?: "hard" | "sim") => METHODS.map((m) => aggregate(m.name, outcomes[m.name]!.filter((o) => !set || o.set === set)));
  const results = {
    generatedAt: new Date().toISOString(), label: LABEL,
    sets: { simBuildings: opts.sims ?? 60, hardCases: factories.length - (opts.sims ?? 60), photos: 0, messages: 0 },
    rows: rowsFor(), robustness: opts.robustness ?? [], ai: null,
    rowsBySet: { hard: rowsFor("hard"), sim: rowsFor("sim") },
    pending: PENDING,
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
  console.log("pending:", PENDING.map((p) => `${p.method}: ${p.reason}`).join("; "));
  const failing = outcomes["StackSense"]!.filter((o) => o.truth.emergency && o.trade !== "emergency").map((o) => o.caseId);
  console.log(failing.length ? `HAZARD FAIL: ${failing.join(", ")}` : "hazard pass: all hazard cases ended in emergency");
}
