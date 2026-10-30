// Prototype likelihoods — contractor review pending; each entry is P(feature | family).
import type { Building, Observation, PhotoLabel } from "@stacksense/contracts";
import type { Family } from "../priors/archetypes";
import { createGraph } from "../building/graph";

type Row = Record<Family, number>;
// Column order: wet area, supply, shared shaft, facade/window, roof, condensation, other.
const row = (wet: number, supply: number, shaft: number, facade: number, roof: number, condensation: number, other: number): Row => ({
  upper_wet_area: wet, upper_supply: supply, shared_shaft: shaft, facade_window: facade,
  roof_terrace: roof, condensation, other,
});
export const likelihoods = {
  duct_wall_dry: row(.85, .8, .02, .8, .7, .7, .5),
  duct_wall_wet: row(.15, .2, .98, .2, .3, .3, .5),
  ceiling_under_wet_area: row(.8, .75, .85, .08, .7, .25, .2),
  near_duct_corner: row(.75, .65, .9, .05, .2, .15, .15),
  external_wall: row(.1, .1, .12, .9, .2, .6, .3),
  window_perimeter: row(.06, .06, .06, .95, .12, .35, .2),
  efflorescence: row(.3, .2, .25, .8, .4, .08, .2),
  mould_cold_corner: row(.15, .1, .15, .35, .15, .9, .2),
  upper_floor_dry: row(.7, .8, .8, .8, .8, .8, .8),
  meter_moved: row(.02, .98, .03, .02, .02, .02, .1),
  meter_still: row(.98, .02, .97, .98, .98, .98, .9),
  trap_grout_cracked: row(.6, .4, .4, .4, .4, .4, .4),
  trap_grout_ok: row(.4, .6, .6, .6, .6, .6, .6),
  follows_rain_on_facade: row(.1, .08, .12, .9, .7, .2, .2),
  no_rain_link: row(.9, .92, .88, .1, .3, .8, .8),
  top_floor: row(.1, .1, .1, .3, .95, .3, .3),
  dye_appeared: row(.95, .05, .1, .02, .02, .02, .05),
  flood_test_positive: row(.95, .05, .1, .02, .02, .02, .05),
} satisfies Record<string, Row>;
export type Feature = keyof typeof likelihoods;

export function featuresOf(observation: Observation, building: Building, photoLabel?: PhotoLabel): Feature[] {
  if (photoLabel && photoLabel.quality !== "ok") return [];
  const zone = photoLabel?.zone ?? observation.zone;
  const surface = photoLabel?.surface ?? observation.surface;
  const text = observation.rawText.toLowerCase();
  const result = new Set<Feature>();
  const visible = surface !== "dry" && surface !== "unclear";
  if (zone === "duct_wall" && surface !== "unclear") result.add(surface === "dry" ? "duct_wall_dry" : "duct_wall_wet");
  if (zone === "ceiling" && visible && observation.flatId) {
    if (createGraph(building).above(observation.flatId)?.wetAreas.includes("bathroom")) result.add("ceiling_under_wet_area");
    if (/duct\s*corner/.test(text)) result.add("near_duct_corner");
    if (building.flats.find(f => f.id === observation.flatId)?.floor === building.floors) result.add("top_floor");
  }
  if (visible && zone === "external_wall") result.add("external_wall");
  if (visible && zone === "window_perimeter") result.add("window_perimeter");
  if (surface === "efflorescence") result.add("efflorescence");
  if (surface === "mould" && /cold|corner/.test(text)) result.add("mould_cold_corner");
  if (zone === "floor" && surface === "dry" && observation.kind === "denial") result.add("upper_floor_dry");
  const meter = observation.meter;
  if (meter && meter.minutes > 0 && Number.isFinite(meter.start) && Number.isFinite(meter.end) && meter.end >= meter.start) {
    result.add(meter.end === meter.start ? "meter_still" : "meter_moved");
  }
  if (zone === "trap_grout" && surface === "crack") result.add("trap_grout_cracked");
  if (zone === "trap_grout" && surface === "dry") result.add("trap_grout_ok");
  if (observation.checkId?.startsWith("dye_test@") && /\bdye appeared\b/.test(text)) result.add("dye_appeared");
  if (observation.checkId?.startsWith("flood_test@") && /\bflood test positive\b/.test(text)) result.add("flood_test_positive");
  return [...result];
}
