import type { EngineState } from "@stacksense/contracts";
import { serverAdapter } from "../llm/server";
import type { LlmAdapter } from "../llm/adapter";
export { PROMPT_VERSION } from "../llm/prompts/baseline";

/** Evaluation only: E.4 uses the same evidence, with no engine odds or trade selection. */
export async function singleLlmBaseline(
  evidence: Pick<EngineState, "building" | "observations">,
  adapter: LlmAdapter = serverAdapter(),
) {
  if (typeof window !== "undefined") throw new Error("Server-only baseline");
  const result = await adapter.baseline({
    buildingJson: JSON.stringify(evidence.building),
    observationsJson: JSON.stringify(evidence.observations),
  });
  if (!result.data) return null;
  // E.4 identifies family/flat, never a component. Invalid/unavailable models stay null.
  return { ...result.data, level: result.data.flatId === null ? "mechanism" as const : "area" as const };
}
