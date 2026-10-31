// Shared execution loop for the CLI and interactive evaluation. No network or filesystem access.
import type {Building,EngineState,Observation,PhotoLabel,RainSeries,RankedCheck} from '../../packages/contracts/src/index';
import {createCase,applyObservations,applySecondOpinion,simulateBuilding} from '../../packages/engine/src/index';
import type {Family} from '../../packages/engine/src/priors/archetypes';
import type {Truth,Outcome,Source,Level} from './metrics';
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
  memory?: Partial<Record<Family, number>>; // robustness only: Dirichlet counts that shift the priors
  /** Answer to a requested check, or null when this case holds no answer for it. Stateful per instance. */
  answer(check: RankedCheck): Observation[] | null;
};

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
export const voiChoice: Chooser = (s) => s.nextChecks.filter((c) => c.excluded === null).sort((a, b) => b.score - a.score);
export const fixedChoice: Chooser = (s, asked) => s.nextChecks
  .filter((c) => (c.excluded === null || c.excluded === "can't change the action") && FIXED_ORDER.includes(c.type) && !asked.has(c.id))
  .sort((a, b) => FIXED_ORDER.indexOf(a.type) - FIXED_ORDER.indexOf(b.type));

export type Trail = { unscripted: string[]; asked: string[]; evidence?: Observation[] };

/** Answer loop shared by the engine-driven methods. */
export function engineRun(c: EvalCase, choose: Chooser, review: boolean, trail: Trail): Outcome {
  const t0 = performance.now();
  const ctx = { rain: c.rain, photoLabels: c.photoLabels };
  const reviewed = (s: EngineState) => (review ? applySecondOpinion(s, null) : s); // no live LLM in eval → labelled fallback
  let s: EngineState = createCase(c.building, { now: c.timeline[0]![0]!.at, memory: c.memory });
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
  trail.evidence = collected;
  const checks = leaders.length - 1, ms = performance.now() - t0;
  const base = { caseId: c.id, set: c.set, truth: c.truth, leaders, checks, ms,
    componentEvidence: componentEvidence(collected, c.photoLabels ?? []) };
  if (s.safety.status === "emergency") return { ...base, trade: "emergency", level: "mechanism", claim: null, decided: true };
  if (s.jobSheet) return { ...base, trade: s.jobSheet.send[0]?.trade ?? "general_inspector", level: s.jobSheet.level as Level, claim: leader(s), decided: true };
  return { ...base, trade: "general_inspector", level: "mechanism", claim: null, decided: false };
}

