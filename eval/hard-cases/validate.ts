// Validates the 30 frozen hard cases against the shared contract and prints a table.
// Run: pnpm --filter @stacksense/engine exec tsx ../../eval/hard-cases/validate.ts
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  Building, Observation, PhotoLabel, RainSeries, SourceFamily, Trade,
} from "../../packages/contracts/src/index";

export const HardCase = z.object({
  id: z.string().regex(/^hc-[pfchal]\d\d$/),
  title: z.string(),
  building: Building,
  // steps with no checkId = chat timeline (applied in order); steps with checkId = answers to engine checks.
  steps: z.array(z.array(Observation).min(1)).min(1),
  truth: z.object({
    family: SourceFamily, flatId: z.string().nullable(), component: z.string().nullable(),
    trade: Trade, emergency: z.boolean(),
  }),
  notes: z.string(),
  rain: RainSeries.optional(),
  photoLabels: z.array(PhotoLabel).optional(),
}).strict();
export type HardCase = z.infer<typeof HardCase>;

const DIR = fileURLToPath(new URL("./", import.meta.url));
const MIX: Record<string, [string, number]> = {
  p: ["plumbing", 6], f: ["rain/facade", 6], c: ["condensation", 4],
  h: ["hazard", 4], a: ["ambiguous", 5], l: ["locked/meter/dark", 5],
};

export function loadHardCases(dir = DIR): HardCase[] {
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort()
    .map((f) => HardCase.parse(JSON.parse(readFileSync(dir + f, "utf8"))));
}

/** Physics/data sanity beyond the schema; returns problems (empty = ok). */
export function problems(c: HardCase): string[] {
  const out: string[] = [];
  const flats = new Map(c.building.flats.map((f) => [f.id, f]));
  const ids = new Set<string>();
  c.steps.flat().forEach((o) => {
    if (ids.has(o.id)) out.push(`duplicate observation id ${o.id}`);
    ids.add(o.id);
    if (o.flatId && !flats.has(o.flatId)) out.push(`${o.id}: unknown flat ${o.flatId}`);
    if (o.provenance !== "simulated") out.push(`${o.id}: provenance must be simulated`);
    if (o.checkId) {
      const [type, fid] = o.checkId.split("@");
      if (fid !== o.flatId) out.push(`${o.id}: checkId target ${fid} != flatId ${o.flatId}`);
      if (type === "meter_check" && !flats.get(fid ?? "")?.hasWaterMeter) out.push(`${o.id}: meter answer for flat without meter`);
    }
  });
  c.steps.forEach((s, i) => {
    const answers = s.filter((o) => o.checkId).length;
    if (answers && answers !== s.length) out.push(`step ${i} mixes timeline and check answers`);
  });
  if (c.steps[0].some((o) => o.checkId)) out.push("step 0 must be the initial chat, not a check answer");
  if (c.truth.flatId && !flats.has(c.truth.flatId)) out.push(`truth flat ${c.truth.flatId} not in building`);
  const kind = c.id[3];
  if ((kind === "h") !== c.truth.emergency) out.push("emergency must be true exactly for hazard cases");
  if (kind === "a" && c.truth.trade !== "general_inspector") out.push("ambiguous cases must be general_inspector");
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cases = loadHardCases();
  let bad = 0;
  const counts: Record<string, number> = {};
  for (const c of cases) {
    counts[c.id[3]] = (counts[c.id[3]] ?? 0) + 1;
    const p = problems(c);
    if (p.length) { bad++; console.error(`✗ ${c.id}: ${p.join("; ")}`); }
  }
  console.table(cases.map((c) => ({
    id: c.id, title: c.title.slice(0, 58), family: c.truth.family, flat: c.truth.flatId ?? "-",
    trade: c.truth.trade, emergency: c.truth.emergency, building: c.building.id, steps: c.steps.length,
  })));
  for (const [k, [name, want]] of Object.entries(MIX)) {
    if (counts[k] !== want) { bad++; console.error(`✗ mix: ${name} has ${counts[k] ?? 0}, want ${want}`); }
  }
  if (cases.length !== 30) { bad++; console.error(`✗ expected 30 cases, found ${cases.length}`); }
  if (bad) process.exit(1);
  console.log(`✓ ${cases.length} hard cases valid (mix ${Object.entries(MIX).map(([k, [n]]) => `${n} ${counts[k]}`).join(", ")})`);
}
