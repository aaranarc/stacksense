// Message-extraction AI eval on the human-reviewed lines only, quota-safe: stops at the first non-live result
// (free-tier 429 → fallback) and never exceeds MAX_CALLS provider requests. Photos are not measured (too few, quota).
// Run (repo root): LIVE_LLM_TESTS=1 pnpm --filter @stacksense/engine exec tsx --env-file="$PWD/apps/web/.env.local" ../../eval/runner/ai-messages.ts [maxCalls]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ChatMessage, Observation } from "../../packages/contracts/src/index";
import { assertLiveLlmOptIn } from "../../packages/ai/src/llm/guard";
import { serverAdapter } from "../../packages/ai/src/llm/server";
import { createReadService } from "../../packages/ai/src/read/pipeline";
import { createCache } from "../../packages/ai/src/read/cache";
import { computeAiMetrics, type ScoredCase } from "../runner-ai/metrics";

export const PHOTO_NOTE = "not measured — too few photos, free-tier quota";
export const COST_NOTE = "$0 (free tier)";

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  assertLiveLlmOptIn();
  const maxCalls = Number(process.argv[2] ?? 15); // shortcut: fixed cap, not a live quota counter — keeps a reserve on a ~20/day tier
  const rows = readFileSync(fileURLToPath(new URL("../data/messages.jsonl", import.meta.url)), "utf8").split("\n").filter(Boolean)
    .map((l) => JSON.parse(l) as { message: unknown; labels: unknown; language: string; humanReviewed: boolean })
    .filter((r) => r.humanReviewed === true);
  let calls = 0, last429 = false;
  const counted: typeof fetch = async (input, init) => {
    calls++;
    const r = await fetch(input, init);
    if (r.status === 429) last429 = true;
    return r;
  };
  const adapter = serverAdapter({ fetch: counted });
  if (!adapter.configured) throw new Error("LLM provider not configured (apps/web/.env.local)");
  const read = createReadService({ adapter, cache: createCache() });
  const labels = Observation.pick({ flatId: true, room: true, zone: true, surface: true, hazards: true, kind: true });
  const scored: ScoredCase[] = [], modes: Record<string, number> = {};
  let stopped = "all reviewed messages attempted";
  for (const row of rows) {
    if (calls >= maxCalls) { stopped = `call cap ${maxCalls} reached (reserve kept)`; break; }
    const message = ChatMessage.parse(row.message), expected = labels.parse(row.labels);
    const start = performance.now(), result = await read({ buildingId: "block-a", messages: [message], photos: [] });
    modes[result.mode] = (modes[result.mode] ?? 0) + 1;
    // A fallback is not a model answer: do not score it, stop (never loop on 429).
    if (result.mode === "fallback") { stopped = last429 ? "first HTTP 429 (free-tier quota) — stopped" : "model unavailable — stopped"; break; }
    scored.push({ kind: "message", language: row.language, expected: { [message.id]: expected }, result, latencyMs: performance.now() - start, costUsd: 0 });
  }
  const m = computeAiMetrics(scored);
  const out = {
    generatedAt: new Date().toISOString(), label: "team-built test, not field accuracy", placeholder: false, humanReviewed: true,
    execution: "live-provider, messages only", reviewedMessages: rows.length, measuredMessages: scored.length, providerRequests: calls,
    modes, stopped, f1ByField: m.f1ByField, f1ByLanguage: m.f1ByLanguage, meanLatencyMs: m.meanLatencyMs,
    photoAccuracy: null, cleanWallFalsePositive: null, photoNote: PHOTO_NOTE, meanCostPerCaseUsd: 0, costNote: COST_NOTE,
  };
  writeFileSync(fileURLToPath(new URL("../results/ai.json", import.meta.url)), JSON.stringify(out, null, 2) + "\n");
  console.log(`messages measured ${scored.length}/${rows.length}, provider requests ${calls}, modes ${JSON.stringify(modes)}; ${stopped}`);
}
