import { Building, Observation, PhotoLabel, SourceFamily, type EngineState, type Hypothesis, type RainSeries } from "@stacksense/contracts";
import { rainFeature, forecastRechecks, type WeatherState } from "./rain";
import { hypothesesForVictims } from "./hypotheses";
import { hypothesisPriors, type Memory } from "./priors/archetypes";
import { featuresOf, likelihoods, type Feature } from "./tables/likelihoods";
import { createGraph } from "./building/graph";
import { safetyOf } from "./safety";
import { rankChecks } from "./voi";
import { recoveryOf } from "./recovery";
import { buildJobSheet } from "./jobSheet";
import { stopRule } from "./stop";
import { applySecondOpinion } from "./secondOpinion";
import { traceStep } from "./trace";

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
  const victim = state.building.flats.find(f => f.id === victimId)!;
  const lateral = state.observations.some(o => o.kind === "professional_finding" && o.finding?.family === "upper_wet_area" && state.building.flats.some(f => f.id === o.flatId && f.floor === victim.floor + 1 && f.position !== victim.position));
  const group = hypothesesForVictims(state.building, [victimId], { caseId: baseId, lateral })[0]!;
  let posterior = hypothesisPriors(state.building, group, state.prediction.memory);
  const graph = createGraph(state.building);
  const aboveId = graph.above(victimId)?.id;
  const stackIds = new Set(graph.sameStack(victimId).map(f => f.id));
  const seen = new Set<string>();
  const warnings: string[] = [];
  const trace: EngineState["trace"] = [];
  for (const obs of state.observations) {
    const labels = state.photoLabels.filter(p => obs.photoIds.includes(p.photoId));
    const label = labels.find(p => p.quality === "ok") ?? labels[0];
    const effectiveZone = label?.quality === "ok" ? label.zone : obs.zone;
    // Complaints at distinct victims are separate cases, never pooled evidence.
    const relevant = obs.flatId === victimId || (obs.kind !== "complaint" && obs.flatId !== null && (
      group.hypotheses.some(h => h.flatId === obs.flatId && (h.family === "upper_wet_area" || h.family === "upper_supply")) || obs.flatId === aboveId || (effectiveZone === "duct_wall" && stackIds.has(obs.flatId))
    ));
    if (!relevant || seen.has(obs.eventKey)) continue;
    seen.add(obs.eventKey);
    if (label && label.quality !== "ok") warnings.push(`Photo ${label.photoId}: ${label.quality}; retake photo, no evidence applied`);
    const features = featuresOf(obs, state.building, label);
    const rain = (state as WeatherState).weather?.rain;
    const weatherFeature = rain ? rainFeature({ ...obs, zone: effectiveZone }, state.building, rain) : null;
    if (weatherFeature) features.push(weatherFeature);
    if (!features.length && !obs.finding) continue;
    let updated = updatePosterior(posterior, group.hypotheses, features);
    if (obs.kind === "professional_finding" && obs.finding) {
      const weights = group.hypotheses.map(h => [h.id, (updated[h.id] ?? 0) * (h.family === obs.finding!.family && (!h.flatId || h.flatId === obs.flatId) ? .999 : .001)] as const);
      const total = weights.reduce((sum, [, w]) => sum + w, 0);
      if (total > 0) updated = Object.fromEntries(weights.map(([id, w]) => [id, w / total]));
    }
    const step = traceStep(posterior, updated, group.hypotheses, obs.id, features, trace.length + 1);
    if (obs.finding) step.changes = step.changes.map(c => ({ ...c, why: `${obs.id}: professional finding ${obs.finding!.family} at ${obs.flatId}` }));
    trace.push(step);
    posterior = updated;
  }
  const next = { ...state, caseId: group.caseId, hypotheses: group.hypotheses, posterior, trace,
    secondOpinion: state.caseId === group.caseId ? state.secondOpinion : null,
    recovery: { ...state.recovery, flags: [...state.recovery.flags.filter(f => !f.startsWith("Photo ")), ...warnings] } };
  const forecast = (state as WeatherState).weather?.forecast;
  if (forecast) next.prediction = { ...next.prediction, forecastRechecks: forecastRechecks(next, forecast) };
  const recovered = { ...next, recovery: recoveryOf(next) };
  const ranked = { ...recovered, nextChecks: recovered.safety.status === "ok" ? rankChecks(recovered) : [] };
  const stopped = { ...ranked, stop: stopRule(ranked) };
  return stopped.secondOpinion ? applySecondOpinion(stopped, stopped.secondOpinion) : { ...stopped, jobSheet: buildJobSheet(stopped) };
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
  const previous = (state as WeatherState).weather;
  const next: WeatherState = { ...state, weather: { ...previous, ...(ctx.rain ? { rain: ctx.rain } : {}), ...(ctx.forecast ? { forecast: ctx.forecast } : {}) }, observations: allObs, photoLabels: [...photoLabels.values()], safety,
    nextChecks: safety.status === "ok" ? state.nextChecks : [],
    stop: safety.status === "emergency" ? { stopped: true, reason: "emergency" } : { stopped: false, reason: null },
    jobSheet: safety.status === "ok" ? state.jobSheet : null,
  };
  return splitCases(next)[0] ?? next;
}
