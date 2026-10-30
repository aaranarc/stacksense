// prototype priors — contractor review pending
import type { z } from "zod";
import { SourceFamily, type Building } from "@stacksense/contracts";
import type { HypothesisGroup } from "../hypotheses";

export type Family = z.infer<typeof SourceFamily>;
export type Memory = Partial<Record<Family, number>>;
type Range = { min: number; mode: number; max: number };
type Archetype = Building["archetype"];

export const archetypes: Record<Archetype, Record<Family, Range>> = {
  MUMBAI_RCC_1990S: {
    upper_wet_area: { min: .20, mode: .32, max: .45 }, upper_supply: { min: .12, mode: .22, max: .32 },
    shared_shaft: { min: .14, mode: .24, max: .34 }, facade_window: { min: .05, mode: .10, max: .20 },
    roof_terrace: { min: .01, mode: .04, max: .12 }, condensation: { min: .01, mode: .04, max: .12 },
    other: { min: .01, mode: .04, max: .15 },
  },
  UK_1960S_BLOCK: {
    upper_wet_area: { min: .10, mode: .20, max: .32 }, upper_supply: { min: .10, mode: .20, max: .32 },
    shared_shaft: { min: .05, mode: .12, max: .24 }, facade_window: { min: .10, mode: .20, max: .34 },
    roof_terrace: { min: .02, mode: .08, max: .20 }, condensation: { min: .08, mode: .15, max: .30 },
    other: { min: .01, mode: .05, max: .15 },
  },
  GENERIC: {
    upper_wet_area: { min: .10, mode: .22, max: .35 }, upper_supply: { min: .10, mode: .20, max: .35 },
    shared_shaft: { min: .08, mode: .18, max: .30 }, facade_window: { min: .08, mode: .16, max: .30 },
    roof_terrace: { min: .02, mode: .08, max: .20 }, condensation: { min: .02, mode: .08, max: .20 },
    other: { min: .02, mode: .08, max: .20 },
  },
};

export function familyPriors(archetype: Archetype, memory: Memory = {}): Record<Family, number> {
  const counts = SourceFamily.options.map(family => {
    const count = memory[family] ?? 0;
    if (!Number.isFinite(count) || count < 0) throw new Error("Memory counts must be finite and nonnegative");
    return [family, archetypes[archetype][family].mode * 10 + count] as const;
  });
  const total = counts.reduce((sum, [, n]) => sum + n, 0);
  return Object.fromEntries(counts.map(([f, n]) => [f, n / total])) as Record<Family, number>;
}

export function hypothesisPriors(building: Building, group: HypothesisGroup, memory: Memory = {}): Record<string, number> {
  const families = familyPriors(building.archetype, memory);
  const victim = building.flats.find(f => f.id === group.victimFlatId);
  const roots = group.hypotheses.filter(h => h.parentId === null);
  const weights = group.hypotheses.map(h => {
    if (h.parentId !== null) return [h.id, 0] as const;
    const count = roots.filter(r => r.family === h.family).length;
    const weight = h.family === "roof_terrace" && victim?.floor !== building.floors ? .0001 : families[h.family];
    return [h.id, weight / count] as const;
  });
  const sum = weights.reduce((n, [, w]) => n + w, 0);
  return Object.fromEntries(weights.map(([id, w]) => [id, w / sum]));
}
