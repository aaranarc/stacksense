import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { EngineState } from "@stacksense/contracts";
import { heroSnapshots } from "../src/scenarios/hero";
import { splitCases } from "../src/bayes";

const directory = fileURLToPath(new URL("../../../fixtures/hero/", import.meta.url));
mkdirSync(directory, { recursive: true });
for (const [i, state] of heroSnapshots().entries()) {
  const serialized = JSON.stringify(state, null, 2) + "\n";
  const parsed = EngineState.safeParse(JSON.parse(serialized));
  if (!parsed.success) throw new Error(parsed.error.message);
  writeFileSync(`${directory}state-${String(i).padStart(2, "0")}.json`, serialized);
}
const cases = splitCases(heroSnapshots()[6]!);
for (const state of cases) {
  writeFileSync(`${directory}case-${state.caseId.split(":").at(-1)}.json`, JSON.stringify(state, null, 2) + "\n");
}
console.log("Wrote 12 hero states and independent 402/202 case fixtures (simulated data)");
