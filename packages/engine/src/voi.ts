import type { EngineState, Hypothesis, RankedCheck } from "@stacksense/contracts";
import { accessPenalty, candidateChecks, type CheckDefinition, type CheckCandidate } from "./tables/checks";
import type { Family } from "./priors/archetypes";
import { featuresOf } from "./tables/likelihoods";

// Minimal action mapping required by A-T09; Job Sheet reasoning is implemented in A-T16.
const tradeForFamily: Record<Family, string> = {
  upper_wet_area: "waterproofer_tiler", upper_supply: "plumber", shared_shaft: "plumber",
  facade_window: "facade_sealant", roof_terrace: "roofer", condensation: "ventilation", other: "general_inspector",
};
export function actionFor(posterior: Record<string, number>, hypotheses: Hypothesis[]): string {
  const trades: Record<string, number> = {};
  for (const h of hypotheses) {
    const trade = tradeForFamily[h.family];
    trades[trade] = (trades[trade] ?? 0) + (posterior[h.id] ?? 0);
  }
  return Object.entries(trades).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "general_inspector";
}
export function entropy(posterior: Record<string, number>): number {
  return Object.values(posterior).reduce((sum, p) => sum - (p > 0 ? p * Math.log2(p) : 0), 0);
}
export function informationGain(posterior: Record<string, number>, hypotheses: Hypothesis[], model: CheckDefinition["outcomes"]) {
  const outcomes = Object.entries(model).map(([outcome, likelihood]) => {
    const weights = hypotheses.map(h => [h.id, (posterior[h.id] ?? 0) * likelihood[h.family]] as const);
    const probability = weights.reduce((sum, [, w]) => sum + w, 0);
    const next = Object.fromEntries(weights.map(([id, w]) => [id, probability > 0 ? w / probability : 0]));
    return { outcome, probability, posterior: next };
  }).filter(o => o.probability > 0);
  const bits = Math.max(0, entropy(posterior) - outcomes.reduce((sum, o) => sum + o.probability * entropy(o.posterior), 0));
  return { bits, outcomes };
}

function completed(state: EngineState, candidate: CheckCandidate): boolean {
  return state.observations.some(o => {
    if (o.checkId !== candidate.id) return false;
    const labels = state.photoLabels.filter(p => o.photoIds.includes(p.photoId));
    const label = labels.find(p => p.quality === "ok") ?? labels[0];
    return featuresOf(o, state.building, label).length > 0;
  });
}
function why(candidate: CheckCandidate): string {
  const id = candidate.flat.id;
  switch (candidate.type) {
    case "duct_photo": return `${id} shares the duct; a dry duct would rule against a shaft leak`;
    case "meter_check": return `${id} has a meter; still versus moving readings distinguish a supply leak`;
    case "trap_grout_photo": return `${id} bathroom trap/grout may help locate the probable wet-area defect`;
    default: return `${candidate.type.replaceAll("_", " ")} at ${id} tests the remaining explanations`;
  }
}
export function rankChecks(state: EngineState): RankedCheck[] {
  return candidateChecks(state, { includeUnavailableMeters: true }).map(candidate => {
    const { definition, flat } = candidate;
    const info = informationGain(state.posterior, state.hypotheses, definition.outcomes);
    const actions = new Set(info.outcomes.map(o => actionFor(o.posterior, state.hypotheses)));
    let excluded: string | null = null;
    if (state.safety.status !== "ok") excluded = state.safety.status === "emergency" ? "unsafe: emergency" : "unsafe: hazard questions incomplete";
    else if (flat.access === "locked") excluded = "flat locked";
    else if (definition.requiresMeter && !flat.hasWaterMeter) excluded = "no meter";
    else if (completed(state, candidate)) excluded = "already checked";
    else if (actions.size <= 1) excluded = "can't change the action";
    const penalty = accessPenalty(flat.access) * definition.delayPenalty;
    const score = excluded ? 0 : info.bits / (Math.max(.5, definition.effortMin) * penalty);
    return {
      id: candidate.id, type: candidate.type, targetFlatId: flat.id, effortMin: definition.effortMin,
      // Infinity is used in the calculation; the finite sentinel preserves JSON/contract validity.
      accessPenalty: Number.isFinite(penalty) ? penalty : Number.MAX_VALUE,
      expectedBits: info.bits, score, why: why(candidate), excluded, instructions: definition.instructions,
    };
  }).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
}
