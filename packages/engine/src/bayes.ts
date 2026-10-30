import { Building, Observation, PhotoLabel, SourceFamily, type EngineState, type Hypothesis, type RainSeries } from "@stacksense/contracts";
import { hypothesesForVictims } from "./hypotheses";
import { hypothesisPriors, type Memory } from "./priors/archetypes";
import { featuresOf, likelihoods, type Feature } from "./tables/likelihoods";
import { createGraph } from "./building/graph";
import { safetyOf } from "./safety";
import { rankChecks } from "./voi";

export type ObservationContext = { rain?: RainSeries; forecast?: RainSeries; photoLabels?: PhotoLabel[] };

export function updatePosterior(prior: Record<string, number>, hypotheses: Hypothesis[], features: Feature[]): Record<string, number> {
  const logs = hypotheses.map(h => {
    const weight = prior[h.id] ?? 0;
    return [h.id, weight > 0 ? Math.log(weight) + features.reduce((sum, f) => sum + Math.log(likelihoods[f][h.family]), 0) : -Infinity] as const;
  });
  const max = Math.max(...logs.map(([, n]) => n));
  if (!Number.isFinite(max)) return { ...prior };
  const weights = logs.map(([id, n]) => [id, Math.exp(n - max)] as const);
  const total = weights.reduce((sum, [, n]) => sum + n, 0);
  return Object.fromEntries(weights.map(([id, n]) => [id, n / total]));
}

export function createCase(building: Building, opts: { memory?: Memory; now?: string } = {}): EngineState {
  const parsed = Building.safeParse(building);
  if (!parsed.success) throw new Error(`Invalid building: ${parsed.error.message}`);
  const now = opts.now ?? "1970-01-01T00:00:00.000Z";
  if (!Number.isFinite(Date.parse(now))) throw new Error("Invalid case time");
  const memory = Object.fromEntries(SourceFamily.options.map(f => [f, opts.memory?.[f] ?? 0]));
  for (const n of Object.values(memory)) if (!Number.isFinite(n) || n < 0) throw new Error("Invalid memory count");
  return {
    caseId: building.id, now, building: parsed.data, observations: [], photoLabels: [], hypotheses: [], posterior: {},
    safety: { status: "incomplete", reasons: ["Hazard questions unanswered"], actions: [] }, nextChecks: [],
    stop: { stopped: false, reason: null }, secondOpinion: null, jobSheet: null,
    recovery: { repair: "not_started", dry: "unknown", paint: "not_ready", day14DueAt: null, reopened: false, flags: [] },
    prediction: { sameStack: [], forecastRechecks: [], seasonal: [], memory }, trace: [],
  };
}

function forVictim(state: EngineState, victimId: string): EngineState {
  const baseId = state.caseId.endsWith(`:${victimId}`) ? state.caseId.slice(0, -victimId.length - 1)
    : state.caseId.startsWith(`${state.building.id}:`) ? state.building.id : state.caseId;
  const group = hypothesesForVictims(state.building, [victimId], { caseId: baseId })[0]!;
  let posterior = hypothesisPriors(state.building, group, state.prediction.memory);
  const graph = createGraph(state.building);
  const aboveId = graph.above(victimId)?.id;
  const stackIds = new Set(graph.sameStack(victimId).map(f => f.id));
  const seen = new Set<string>();
  const warnings: string[] = [];
  for (const obs of state.observations) {
    // Complaints at distinct victims are separate cases, never pooled evidence.
    const relevant = obs.flatId === victimId || (obs.kind !== "complaint" && obs.flatId !== null && (
      obs.flatId === aboveId || (obs.zone === "duct_wall" && stackIds.has(obs.flatId))
    ));
    if (!relevant || seen.has(obs.eventKey)) continue;
    seen.add(obs.eventKey);
    const labels = state.photoLabels.filter(p => obs.photoIds.includes(p.photoId));
    const label = labels.find(p => p.quality === "ok") ?? labels[0];
    if (label && label.quality !== "ok") warnings.push(`Photo ${label.photoId}: ${label.quality}; retake photo, no evidence applied`);
    posterior = updatePosterior(posterior, group.hypotheses, featuresOf(obs, state.building, label));
  }
  const next = { ...state, caseId: group.caseId, hypotheses: group.hypotheses, posterior,
    recovery: { ...state.recovery, flags: [...state.recovery.flags.filter(f => !f.startsWith("Photo ")), ...warnings] } };
  return { ...next, nextChecks: next.safety.status === "ok" ? rankChecks(next) : [] };
}

export function splitCases(state: EngineState): EngineState[] {
  const victims = [...new Set(state.observations.filter(o => o.kind === "complaint" && o.flatId !== null).map(o => o.flatId!))];
  return victims.map(id => forVictim(state, id));
}

export function applyObservations(state: EngineState, observations: Observation[], ctx: ObservationContext = {}): EngineState {
  const parsed = Observation.array().safeParse(observations);
  if (!parsed.success) throw new Error(`Invalid observation: ${parsed.error.message}`);
  // Safety scans all reports before deduplication or Bayesian inference.
  const safety = safetyOf([...state.observations, ...parsed.data]);
  const labels = PhotoLabel.array().safeParse(ctx.photoLabels ?? []);
  if (!labels.success) throw new Error(`Invalid photo labels: ${labels.error.message}`);
  const allObs = [...state.observations];
  for (const obs of parsed.data) if (!allObs.some(o => JSON.stringify(o) === JSON.stringify(obs))) allObs.push(obs);
  const photoLabels = new Map(state.photoLabels.map(p => [p.photoId, p]));
  for (const label of labels.data) photoLabels.set(label.photoId, label);
  const next: EngineState = { ...state, observations: allObs, photoLabels: [...photoLabels.values()], safety,
    nextChecks: safety.status === "ok" ? state.nextChecks : [],
    stop: safety.status === "emergency" ? { stopped: true, reason: "emergency" } : { stopped: false, reason: null },
    jobSheet: safety.status === "ok" ? state.jobSheet : null,
  };
  return splitCases(next)[0] ?? next;
}
