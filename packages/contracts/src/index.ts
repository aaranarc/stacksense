import { z } from "zod";

// ---------- enums ----------
export const Region = z.enum(["IN", "UK"]);
export const Orientation = z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
export const SourceFamily = z.enum([
  "upper_wet_area", "upper_supply", "shared_shaft", "facade_window",
  "roof_terrace", "condensation", "other",
]);
export const ClaimLevel = z.enum(["mechanism", "area", "component"]);
export const SurfaceState = z.enum([
  "dry", "damp_stain", "active_blistering", "efflorescence", "mould", "crack", "peeling", "unclear",
]);
export const Zone = z.enum([
  "ceiling", "duct_wall", "window_perimeter", "external_wall", "skirting", "floor", "trap_grout", "meter", "other", "unclear",
]);
export const HazardType = z.enum(["water_near_electrics", "sagging_ceiling", "fast_ingress", "sewage"]);
export const Trade = z.enum([
  "plumber", "waterproofer_tiler", "roofer", "facade_sealant", "plasterer_decorator",
  "ventilation", "electrician", "structural_engineer", "general_inspector",
]);
export const CheckType = z.enum([
  "duct_photo", "trap_grout_photo", "meter_check", "ceiling_photo", "dye_test",
  "flood_test", "rain_recheck", "moisture_reading", "inspect",
]);

// ---------- building ----------
export const Flat = z.object({
  id: z.string(),                       // "402"
  floor: z.number().int(),
  position: z.string(),                 // "02"
  wetAreas: z.array(z.enum(["bathroom", "kitchen", "wc"])),
  externalWalls: z.array(Orientation),
  hasWaterMeter: z.boolean(),
  access: z.enum(["open", "locked", "unknown"]),
});
export const Stack = z.object({
  id: z.string(),
  kind: z.enum(["wet_stack", "duct", "rainwater_pipe"]),
  flatIds: z.array(z.string()),
});
export const Building = z.object({
  id: z.string(), name: z.string(), region: Region,
  archetype: z.enum(["MUMBAI_RCC_1990S", "UK_1960S_BLOCK", "GENERIC"]),
  lat: z.number(), lon: z.number(), floors: z.number().int(), hasTerrace: z.boolean(),
  flats: z.array(Flat), stacks: z.array(Stack),
  moistureThresholdWme: z.number().min(0).max(100).optional(),
});

// ---------- input from chat / phone ----------
export const ChatMessage = z.object({
  id: z.string(), at: z.string().datetime(),
  senderKey: z.string(),                // pseudonymised, e.g. "S07"
  text: z.string(), attachmentIds: z.array(z.string()),
});
export const Box = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number(), label: z.string() });
export const PhotoLabel = z.object({
  photoId: z.string(), surface: SurfaceState, zone: Zone,
  quality: z.enum(["ok", "too_dark", "blurry", "too_far"]),
  boxes: z.array(Box), meterDigits: z.string().nullable(),
  humanCorrected: z.boolean(),
});
export const Observation = z.object({
  id: z.string(),
  flatId: z.string().nullable(),
  eventKey: z.string(),                 // same physical event → same key → counted once
  at: z.string().datetime(),
  kind: z.enum([
    "complaint", "denial", "check_result", "meter_reading", "moisture_reading",
    "professional_finding", "repair_done", "recapture",
  ]),
  zone: Zone, surface: SurfaceState, room: z.string().nullable(),
  hazards: z.array(HazardType),
  hazardQuestionsAnswered: z.boolean(),
  checkId: z.string().nullable(),       // set when this answers a requested check
  meter: z.object({ start: z.number(), end: z.number(), minutes: z.number() }).nullable(),
  moisture: z.object({ value: z.number(), unit: z.enum(["%WME", "relative"]) }).nullable(),
  finding: z.object({ family: SourceFamily, component: z.string().nullable() }).nullable(),
  photoIds: z.array(z.string()), sourceMessageIds: z.array(z.string()),
  provenance: z.enum(["observed", "reported", "simulated"]),
  rawText: z.string(),                  // pseudonymised text; safety backstop scans it
});

// ---------- engine state ----------
export const Hypothesis = z.object({
  id: z.string(), family: SourceFamily, level: ClaimLevel, label: z.string(),
  flatId: z.string().nullable(), stackId: z.string().nullable(), orientation: Orientation.nullable(),
  parentId: z.string().nullable(),      // component → area → mechanism
});
export const RankedCheck = z.object({
  id: z.string(), type: CheckType, targetFlatId: z.string().nullable(),
  effortMin: z.number(), accessPenalty: z.number(),
  expectedBits: z.number(), score: z.number(),
  why: z.string(), excluded: z.string().nullable(),
  instructions: z.object({ en: z.string(), hi: z.string(), mr: z.string() }),
});
export const Safety = z.object({
  status: z.enum(["ok", "incomplete", "emergency"]),
  reasons: z.array(z.string()), actions: z.array(z.string()),
});
export const SecondOpinion = z.object({
  verdict: z.enum(["objection", "needs_evidence", "no_objection", "review_failed"]),
  allowedLevel: ClaimLevel, claim: z.string(),
  supports: z.array(z.string()), challenges: z.array(z.string()),
  unknown: z.array(z.string()), wouldChange: z.array(z.string()),
  source: z.enum(["llm", "fallback"]),
});
export const JobSheet = z.object({
  caseId: z.string(), region: Region,
  probableSource: z.string(), level: ClaimLevel,
  send: z.array(z.object({ trade: Trade, why: z.string() })),
  dontSend: z.array(z.object({ trade: Trade, why: z.string() })),
  access: z.string(), verifyOnSite: z.array(z.string()),
  notJustifiedYet: z.array(z.string()), safetyFlags: z.array(z.string()),
  evidencePhotoIds: z.array(z.string()),
  responsibilityLinks: z.array(z.object({ label: z.string(), url: z.string().url() })),
  timestampTrail: z.array(z.object({ label: z.string(), at: z.string() })),
});
export const Recovery = z.object({
  repair: z.enum(["not_started", "done"]),
  dry: z.enum(["unknown", "not_dry", "dry"]),
  paint: z.enum(["not_ready", "ready"]),
  day14DueAt: z.string().nullable(), reopened: z.boolean(), flags: z.array(z.string()),
});
export const Prediction = z.object({
  sameStack: z.array(z.object({ flatId: z.string(), why: z.string() })),
  forecastRechecks: z.array(z.object({ flatId: z.string(), orientation: Orientation, afterDate: z.string(), why: z.string() })),
  seasonal: z.array(z.string()),
  memory: z.record(SourceFamily, z.number()),
});
export const TraceStep = z.object({
  step: z.number(), observationId: z.string().nullable(),
  changes: z.array(z.object({ hypothesisId: z.string(), before: z.number(), after: z.number(), why: z.string() })),
});
export const EngineState = z.object({
  caseId: z.string(), now: z.string(), building: Building,
  observations: z.array(Observation), photoLabels: z.array(PhotoLabel),
  hypotheses: z.array(Hypothesis), posterior: z.record(z.string(), z.number()),
  safety: Safety, nextChecks: z.array(RankedCheck),
  stop: z.object({ stopped: z.boolean(), reason: z.string().nullable() }),
  secondOpinion: SecondOpinion.nullable(), jobSheet: JobSheet.nullable(),
  recovery: Recovery, prediction: Prediction, trace: z.array(TraceStep),
});

// ---------- weather ----------
export const RainSeries = z.object({
  lat: z.number(), lon: z.number(),
  hourly: z.array(z.object({ t: z.string(), precipMm: z.number(), windDirDeg: z.number(), windSpeedMs: z.number() })),
  source: z.enum(["open-meteo-archive", "open-meteo-forecast", "fixture"]),
});

// ---------- API payloads ----------
export const ReadRequest = z.object({
  buildingId: z.string(), messages: z.array(ChatMessage),
  photos: z.array(z.object({ id: z.string(), dataUrl: z.string() })),
});
export const ReadResult = z.object({
  observations: z.array(Observation), photoLabels: z.array(PhotoLabel),
  senderMap: z.record(z.string(), z.string().nullable()),   // senderKey → flatId | null
  warnings: z.array(z.string()), mode: z.enum(["live", "cached", "fallback"]),
});
export const SecondOpinionRequest = z.object({ state: EngineState });
export const LinkRequest = z.object({ caseId: z.string(), checkId: z.string(), flatId: z.string(), lang: z.enum(["en", "hi", "mr"]) });
export const LinkResult = z.object({ url: z.string().url(), token: z.string(), waUrl: z.string().url() });

// ---------- evaluation ----------
export const EvalRow = z.object({
  method: z.string(), rightTrade: z.number(), top1: z.array(z.number()),   // after 1,2,3 checks
  overclaim: z.number(), harmfulFlips: z.number(), checksToDecision: z.number(),
  hazardPass: z.number(), msPerCase: z.number(),
});
export const EvalResults = z.object({
  generatedAt: z.string(), label: z.literal("team-built test, not field accuracy"),
  sets: z.object({ simBuildings: z.number(), hardCases: z.number(), photos: z.number(), messages: z.number() }),
  rows: z.array(EvalRow),
  robustness: z.array(z.object({ priorShiftPct: z.number(), top1: z.number() })),
  ai: z.object({
    photoAccuracy: z.number(), cleanWallFalsePositive: z.number(),
    f1ByField: z.record(z.string(), z.number()), f1ByLanguage: z.record(z.string(), z.number()),
    costPerCaseUsd: z.number(),
  }).nullable(),
});

export type Building = z.infer<typeof Building>;
export type Flat = z.infer<typeof Flat>;
export type ChatMessage = z.infer<typeof ChatMessage>;
export type PhotoLabel = z.infer<typeof PhotoLabel>;
export type Observation = z.infer<typeof Observation>;
export type Hypothesis = z.infer<typeof Hypothesis>;
export type RankedCheck = z.infer<typeof RankedCheck>;
export type SecondOpinion = z.infer<typeof SecondOpinion>;
export type JobSheet = z.infer<typeof JobSheet>;
export type EngineState = z.infer<typeof EngineState>;
export type RainSeries = z.infer<typeof RainSeries>;
export type ReadRequest = z.infer<typeof ReadRequest>;
export type ReadResult = z.infer<typeof ReadResult>;
export type EvalResults = z.infer<typeof EvalResults>;
