import type { z } from "zod";
import { CheckType, SourceFamily, type EngineState, type Flat, type RankedCheck } from "@stacksense/contracts";
import { createGraph } from "../building/graph";
import { likelihoods } from "./likelihoods";
import type { Family } from "../priors/archetypes";

export type CheckKind = z.infer<typeof CheckType>;
export type CheckDefinition = {
  target: "below_same_stack" | "above" | "victim";
  effortMin: number; delayPenalty: number; requiresMeter: boolean;
  safeOnlyIfSafetyOk: boolean; professional: boolean;
  outcomes: Record<string, Record<Family, number>>;
  instructions: RankedCheck["instructions"];
};
const complement = (positive: Record<Family, number>) => ({
  positive, negative: Object.fromEntries(SourceFamily.options.map(f => [f, 1 - positive[f]])) as Record<Family, number>,
});
const uninformative = Object.fromEntries(SourceFamily.options.map(f => [f, .5])) as Record<Family, number>;
const instructions = (en: string, hi: string, mr: string) => ({ en, hi, mr });
const define = (target: CheckDefinition["target"], effortMin: number, outcomes: CheckDefinition["outcomes"],
  text: RankedCheck["instructions"], extra: Partial<CheckDefinition> = {}): CheckDefinition => ({
  target, effortMin, outcomes, instructions: text, delayPenalty: 1, requiresMeter: false,
  safeOnlyIfSafetyOk: true, professional: false, ...extra,
});

export const checkCatalog: Record<CheckKind, CheckDefinition> = {
  duct_photo: define("below_same_stack", .5, { dry: likelihoods.duct_wall_dry, wet: likelihoods.duct_wall_wet }, instructions(
    "Photograph the duct wall only if safe; keep clear of electrical fittings.",
    "सुरक्षित हो तभी डक्ट की दीवार की फोटो लें; बिजली के उपकरणों से दूर रहें।",
    "सुरक्षित असेल तरच डक्टच्या भिंतीचा फोटो घ्या; विद्युत उपकरणांपासून दूर राहा।")),
  trap_grout_photo: define("above", 1, { cracked: likelihoods.trap_grout_cracked, ok: likelihoods.trap_grout_ok }, instructions(
    "Photograph the floor trap and grout only if safe; do not remove fittings.",
    "सुरक्षित हो तभी फ्लोर ट्रैप और ग्राउट की फोटो लें; कुछ खोलें नहीं।",
    "सुरक्षित असेल तरच फ्लोअर ट्रॅप व ग्राउटचा फोटो घ्या; काहीही काढू नका।")),
  ceiling_photo: define("victim", .5, complement(uninformative), instructions(
    "Photograph the ceiling from a safe distance only if safe; do not stand under bulges.",
    "सुरक्षित हो तभी दूर से छत की फोटो लें; फूली छत के नीचे न खड़े हों।",
    "सुरक्षित असेल तरच दूरून छताचा फोटो घ्या; फुगलेल्या छताखाली उभे राहू नका।")),
  meter_check: define("above", 10, { moved: likelihoods.meter_moved, still: likelihoods.meter_still }, instructions(
    "Photograph the meter before and after ten minutes with taps off only if safe; record both readings.",
    "सुरक्षित हो तभी नल बंद करके मीटर की अभी और दस मिनट बाद फोटो लें; दोनों अंक लिखें।",
    "सुरक्षित असेल तरच नळ बंद करून मीटरचे आता व दहा मिनिटांनी फोटो घ्या; दोन्ही नोंदी लिहा।"), { requiresMeter: true }),
  dye_test: define("above", 120, complement(likelihoods.dye_appeared), instructions(
    "Ask a professional for a dye test only if safe; follow their site instructions.",
    "सुरक्षित हो तभी विशेषज्ञ से डाई टेस्ट करवाएँ; उनके निर्देश मानें।",
    "सुरक्षित असेल तरच तज्ज्ञांकडून डाई चाचणी करून घ्या; त्यांचे निर्देश पाळा।"), { professional: true }),
  flood_test: define("above", 1440, complement(likelihoods.flood_test_positive), instructions(
    "Ask a professional for a supervised flood test only if safe; do not flood the floor yourself.",
    "सुरक्षित हो तभी विशेषज्ञ की निगरानी में फ्लड टेस्ट करवाएँ; खुद पानी न भरें।",
    "सुरक्षित असेल तरच तज्ज्ञांच्या देखरेखीखाली फ्लड चाचणी करा; स्वतः पाणी भरू नका।"), { professional: true }),
  rain_recheck: define("victim", 0, complement(likelihoods.follows_rain_on_facade), instructions(
    "Recheck from indoors after rain only if safe; do not lean outside the window.",
    "सुरक्षित हो तभी बारिश के बाद अंदर से दोबारा देखें; खिड़की से बाहर न झुकें।",
    "सुरक्षित असेल तरच पावसानंतर आतून पुन्हा पाहा; खिडकीबाहेर वाकू नका।"), { delayPenalty: 2880 }),
  moisture_reading: define("victim", 30, complement(uninformative), instructions(
    "Ask a professional for a moisture reading only if safe; a photo cannot measure moisture.",
    "सुरक्षित हो तभी विशेषज्ञ से नमी की रीडिंग लें; फोटो से नमी नहीं मापी जा सकती।",
    "सुरक्षित असेल तरच तज्ज्ञांकडून ओलाव्याची नोंद घ्या; फोटोने ओलावा मोजता येत नाही।"), { professional: true }),
  inspect: define("victim", 60, Object.fromEntries(SourceFamily.options.map(outcome => [outcome,
    Object.fromEntries(SourceFamily.options.map(f => [f, f === outcome ? .9 : .1 / 6])) as Record<Family, number>,
  ])), instructions(
    "Arrange a professional inspection only if safe; keep away from hazardous areas.",
    "सुरक्षित हो तभी विशेषज्ञ से निरीक्षण करवाएँ; खतरनाक जगहों से दूर रहें।",
    "सुरक्षित असेल तरच तज्ज्ञांकडून तपासणी करून घ्या; धोकादायक जागांपासून दूर राहा।"), { professional: true }),
};

export function accessPenalty(access: Flat["access"]): number {
  return access === "locked" ? Infinity : access === "unknown" ? 3 : 1;
}

export type CheckCandidate = { id: string; type: CheckKind; flat: Flat; definition: CheckDefinition };
export function candidateChecks(state: EngineState, opts: { includeUnavailableMeters?: boolean } = {}): CheckCandidate[] {
  const victimId = state.hypotheses[0]?.id.split(":")[0];
  const victim = state.building.flats.find(f => f.id === victimId);
  if (!victim) return [];
  const graph = createGraph(state.building);
  const below = graph.below(victim);
  const sameStack = new Set(graph.sameStack(victim).map(f => f.id));
  const result: CheckCandidate[] = [];
  for (const type of CheckType.options) {
    const definition = checkCatalog[type];
    const flat = definition.target === "victim" ? victim : definition.target === "above" ? graph.above(victim)
      : below && sameStack.has(below.id) ? below : undefined;
    if (!flat || (definition.requiresMeter && !flat.hasWaterMeter && !opts.includeUnavailableMeters)) continue;
    result.push({ id: `${type}@${flat.id}`, type, flat, definition });
  }
  return result;
}
