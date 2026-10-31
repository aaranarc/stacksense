// Baseline 4 prefetch: single LLM (prompt E.4) on exactly the evidence StackSense collected per case. Live calls; cached.
// Run (from repo root): LIVE_LLM_TESTS=1 pnpm --filter @stacksense/engine exec tsx --env-file="$PWD/apps/web/.env.local" ../../eval/runner/llm-baseline.ts
import { assertLiveLlmOptIn } from "../../packages/ai/src/llm/guard";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { singleLlmBaseline, PROMPT_VERSION } from "../../packages/ai/src/baseline/index";
import { CACHE_DIR, METHODS, hardCases, simCases, type CachedBaseline, type Trail } from "./run";

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  assertLiveLlmOptIn();
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  const key = provider === "openai" ? process.env.OPENAI_API_KEY : provider === "gemini" ? process.env.GEMINI_API_KEY : undefined;
  // Without a real provider key every answer would be a fallback null; refuse rather than cache 90 non-answers.
  if (!key) { console.error(`No usable LLM key: LLM_PROVIDER must be "gemini" or "openai" with GEMINI_API_KEY / OPENAI_API_KEY set. Nothing called, nothing cached.`); process.exit(1); }
  mkdirSync(CACHE_DIR, { recursive: true });
  const model = `${process.env.LLM_PROVIDER ?? "gemini"}:${process.env.GEMINI_MODEL ?? process.env.OPENAI_MODEL ?? "default"}`;
  let calls = 0, nulls = 0, reused = 0;
  // Free-tier quota (~20/day): the 30 hard cases only; sims stay unevaluated for this baseline.
  const hardOnly = !process.argv.includes("--with-sims");
  for (const make of hardOnly ? hardCases() : [...hardCases(), ...simCases(60)]) {
    const c = make(), trail: Trail = { unscripted: [], asked: [] };
    METHODS[0]!.run(c, trail); // StackSense run → trail.evidence = what it saw
    const evidence = { building: c.building, observations: trail.evidence ?? [] };
    const evidenceHash = createHash("sha256").update(JSON.stringify(evidence) + PROMPT_VERSION).digest("hex");
    const file = CACHE_DIR + c.id + ".json";
    if (existsSync(file) && (JSON.parse(readFileSync(file, "utf8")) as CachedBaseline).evidenceHash === evidenceHash) { reused++; continue; }
    calls++;
    const result = await singleLlmBaseline(evidence);
    // null = provider failure (quota, outage, invalid twice): never cached as an answer; retried on the next run.
    if (!result) {
      nulls++; process.stdout.write(`${c.id}:unavailable `);
      // Stop at the first failure: never loop on a 429 or burn the shared free-tier quota.
      console.error("\nModel unavailable (quota/outage) — stopping at the first failure; nothing cached for it."); break;
      continue;
    }
    const row: CachedBaseline = { caseId: c.id, promptVersion: PROMPT_VERSION, model, evidenceHash, result };
    writeFileSync(file, JSON.stringify(row, null, 1) + "\n");
    process.stdout.write(`${c.id}:${result.trade} `);
  }
  console.log(`\n${calls} live calls (${nulls} unavailable, not cached), ${reused} reused from cache.`);
}
