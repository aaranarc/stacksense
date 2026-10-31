import { serverAdapter } from "../src/llm/server";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { createAdapter } from "../src/llm/adapter";
import { geminiProvider } from "../src/llm/gemini";
import { openaiProvider } from "../src/llm/openai";
import { PROMPT as readPrompt } from "../src/llm/prompts/read";
import { PROMPT as photoPrompt } from "../src/llm/prompts/photo";
import { PROMPT as opinionPrompt } from "../src/llm/prompts/secondOpinion";
import { PROMPT as baselinePrompt } from "../src/llm/prompts/baseline";

describe("A-T13 structured model adapter", () => {
  it("copies all four prompts verbatim", () => {
    const plan = readFileSync(new URL("../../../docs/plan/A_CORE_Codex_Mac.md", import.meta.url), "utf8");
    [readPrompt, photoPrompt, opinionPrompt, baselinePrompt].forEach((prompt,i) => {
      const block = plan.match(new RegExp(`## E\\.${i+1} .*?\x60\x60\x60text\\n([\\s\\S]*?)\x60\x60\x60`, "s"))?.[1];
      expect(prompt).toBe(block);
    });
  });
  it("accepts valid schema data and repairs invalid output exactly once", async () => {
    const provider = vi.fn().mockResolvedValueOnce({ nonsense: true }).mockResolvedValueOnce({ observations: [] });
    const result = await createAdapter({ provider }).readChat({ buildingSummary: "Block A", messagesJson: "[]" });
    expect(result.source).toBe("llm"); expect(result.data).toEqual({ observations: [] });
    expect(provider).toHaveBeenCalledTimes(2);
    expect(provider.mock.calls[1]?.[0].repair).toContain("observations");
  });
  it("falls back on persistent invalid outputs, timeouts or absent credentials", async () => {
    const invalid = vi.fn(async () => ({ observations: "invalid" }));
    expect((await createAdapter({ provider: invalid }).readChat({ buildingSummary: "", messagesJson: "[]" })).source).toBe("fallback");
    expect(invalid).toHaveBeenCalledTimes(2);
    const timeout = vi.fn(() => new Promise<unknown>(() => {}));
    expect((await createAdapter({ provider: timeout, timeoutMs: 5 }).readPhoto({ checkType:"inspect", flatId:"402",instruction:"only if safe",images:[] })).data).toBeNull();
    expect(timeout).toHaveBeenCalledTimes(2);
    expect((await createAdapter({}).secondOpinion({ topHypothesisLabel:"",topProbabilityPct:"0",otherHypotheses:"",observationsJson:"[]",checksJson:"[]" })).source).toBe("fallback");
  });
  it("validates every adapter method including photo boxes and reviewer verdicts", async () => {
    const provider = vi.fn().mockResolvedValueOnce({ surface:"dry",zone:"ceiling",boxes:[],meterDigits:null })
      .mockResolvedValueOnce({ verdict:"no_objection",allowedLevel:"area",claim:"Probable area",supports:[],challenges:[],unknown:[],wouldChange:[] })
      .mockResolvedValueOnce({ family:"other",flatId:null,trade:"general_inspector",emergency:false });
    const a = createAdapter({provider});
    expect((await a.readPhoto({checkType:"inspect",flatId:"402",instruction:"",images:[]})).source).toBe("llm");
    expect((await a.secondOpinion({topHypothesisLabel:"",topProbabilityPct:"0",otherHypotheses:"",observationsJson:"[]",checksJson:"[]"})).source).toBe("llm");
    expect((await a.baseline({buildingJson:"{}",observationsJson:"[]"})).source).toBe("llm");
  });
  it("sends provider schemas and images without putting credentials in URLs", async () => {
    const transport = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ candidates:[{content:{parts:[{text:'{"observations":[]}' }]}}] }),{status:200}));
    const a = createAdapter({ provider: geminiProvider({apiKey:"test-value",model:"test-model",fetch:transport as typeof fetch}) });
    expect((await a.readChat({buildingSummary:"",messagesJson:"[]"})).source).toBe("llm");
    expect(transport.mock.calls[0]?.[0]).not.toContain("test-value");
    const request = JSON.parse((transport.mock.calls[0] as unknown as [string,RequestInit])[1].body as string);
    expect(request.generationConfig.responseJsonSchema).toBeTruthy();
    const openaiFetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({choices:[{message:{content:'{"surface":"dry","zone":"ceiling","boxes":[],"meterDigits":null}'}}]})));
    const b = createAdapter({ provider: openaiProvider({apiKey:"test-value",model:"test-model",fetch:openaiFetch as typeof fetch}) });
    expect((await b.readPhoto({checkType:"inspect",flatId:"402",instruction:"",images:["data:image/jpeg;base64,YQ=="]})).source).toBe("llm");
    const body = JSON.parse((openaiFetch.mock.calls[0] as unknown as [string,RequestInit])[1].body as string);
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.messages[1].content[1].type).toBe("image_url");
  });
});

it("server factory falls back without keys and refuses browser use", async () => {
  vi.stubEnv("GEMINI_API_KEY", ""); vi.stubEnv("OPENAI_API_KEY", "");
  expect((await serverAdapter().readChat({buildingSummary:"",messagesJson:"[]"})).source).toBe("fallback");
  vi.stubGlobal("window", {}); expect(() => serverAdapter()).toThrow("Server-only");
  vi.unstubAllGlobals(); vi.unstubAllEnvs();
});
