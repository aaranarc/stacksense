import {afterEach,expect,it,vi} from "vitest";
import {serverAdapter} from "../src/llm/server";
import {geminiProvider} from "../src/llm/gemini";
import {assertLiveLlmOptIn,guardLlmTransport} from "../src/llm/guard";
const valid={observations:[]};
const gemini=(value:unknown=valid)=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(value)}]}}]}),{status:200});
const compatible=(value:unknown=valid)=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(value)}}]}),{status:200});
const quota=()=>new Response('{}',{status:429});
const fields={buildingSummary:'test block',messagesJson:'[]'};
function setup(){for(const [k,v] of Object.entries({LLM_PROVIDER:'gemini',GEMINI_API_KEY:'test-gemini',GEMINI_MODEL:'free-primary',GEMINI_FALLBACK_MODEL:'free-secondary',LLM_FALLBACK_PROVIDER:'openai',OPENAI_BASE_URL:'https://compatible.example.invalid/inference',OPENAI_MODEL:'test-model',OPENAI_API_KEY:'test-compatible',LIVE_LLM_TESTS:'0'}))vi.stubEnv(k,v);}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('uses the second Gemini model once after a primary 429',async()=>{
 setup();const transport=vi.fn().mockResolvedValueOnce(quota()).mockResolvedValueOnce(gemini());vi.stubGlobal('fetch',transport);
 const result=await serverAdapter().readChat(fields);expect(result.source).toBe('llm');expect(transport).toHaveBeenCalledTimes(2);expect(String(transport.mock.calls[0]?.[0])).toContain('free-primary');expect(String(transport.mock.calls[1]?.[0])).toContain('free-secondary');expect(result.warnings.join(' ')).toContain('quota');
});
it('uses the configured compatible endpoint only after both Gemini models return 429',async()=>{
 setup();const transport=vi.fn().mockResolvedValueOnce(quota()).mockResolvedValueOnce(quota()).mockResolvedValueOnce(compatible());vi.stubGlobal('fetch',transport);
 expect((await serverAdapter().readChat(fields)).source).toBe('llm');expect(transport).toHaveBeenCalledTimes(3);expect(transport.mock.calls[2]?.[0]).toBe('https://compatible.example.invalid/inference/chat/completions');
 const init=transport.mock.calls[2]?.[1] as RequestInit;expect(new Headers(init.headers).get('authorization')).toBe('Bearer test-compatible');expect(new Headers(init.headers).get('x-goog-api-key')).toBeNull();expect(JSON.parse(String(init.body)).model).toBe('test-model');
});
it('stops after the bounded quota chain without retrying exhausted models',async()=>{
 setup();const transport=vi.fn(async()=>quota());vi.stubGlobal('fetch',transport);
 const result=await serverAdapter().readChat(fields);expect(result.source).toBe('fallback');expect(result.warnings).toContain('Fallback (AI quota reached)');expect(transport).toHaveBeenCalledTimes(3);
});
it('repairs only the selected successful provider and never restarts the quota chain',async()=>{
 setup();const transport=vi.fn().mockResolvedValueOnce(quota()).mockResolvedValueOnce(quota()).mockResolvedValueOnce(compatible({bad:true})).mockResolvedValueOnce(compatible());vi.stubGlobal('fetch',transport);
 expect((await serverAdapter().readChat(fields)).source).toBe('llm');expect(transport).toHaveBeenCalledTimes(4);expect(String(transport.mock.calls[3]?.[0])).toContain('compatible.example.invalid');
});
it('does not switch providers on non-quota HTTP errors or retry an HTTP failure',async()=>{
 setup();const transport=vi.fn(async()=>new Response('{}',{status:503}));vi.stubGlobal('fetch',transport);
 expect((await serverAdapter().readChat(fields)).source).toBe('fallback');expect(transport).toHaveBeenCalledTimes(1);
});
it('requires an explicit second model and avoids retrying a duplicate configured model',async()=>{
 setup();vi.stubEnv('GEMINI_FALLBACK_MODEL','free-primary');const transport=vi.fn(async()=>quota());vi.stubGlobal('fetch',transport);
 expect((await serverAdapter().readChat(fields)).warnings).toContain('Fallback (AI quota reached)');expect(transport).toHaveBeenCalledTimes(1);
});
it('keeps native test transports disabled without live opt-in, even if a key is configured',async()=>{
 setup();let calls=0;vi.stubGlobal('fetch',async()=>{calls++;return gemini();});
 const result=await serverAdapter().readChat(fields);expect(result.source).toBe('fallback');expect(calls).toBe(0);expect(result.warnings.join(' ')).toContain('LIVE_LLM_TESTS=1');
 vi.stubEnv('LIVE_LLM_TESTS','1');expect((await serverAdapter().readChat(fields)).source).toBe('llm');expect(calls).toBe(1);
});
it('requires the live opt-in for explicit evaluation, warm-up and health checks',()=>{
 vi.stubEnv('LIVE_LLM_TESTS','0');expect(()=>assertLiveLlmOptIn()).toThrow('LIVE_LLM_TESTS=1');vi.stubEnv('LIVE_LLM_TESTS','1');expect(()=>assertLiveLlmOptIn()).not.toThrow();
});

it('keeps test/eval guards active even under Vercel environment flags',()=>{
 const old=[...process.argv];vi.stubEnv('NODE_ENV','production');vi.stubEnv('VITEST','');vi.stubEnv('VERCEL','1');vi.stubEnv('LIVE_LLM_TESTS','0');
 try{process.argv[1]=['C:','project','eval','run.ts'].join(String.fromCharCode(92));expect(()=>guardLlmTransport((async()=>new Response()) as typeof fetch)).toThrow('LIVE_LLM_TESTS=1');}
 finally{process.argv.splice(0,process.argv.length,...old);}
});

it('leaves the compatible provider disabled unless explicitly selected',async()=>{
 setup();vi.stubEnv('LLM_FALLBACK_PROVIDER','');const transport=vi.fn(async()=>quota());vi.stubGlobal('fetch',transport);
 const result=await serverAdapter().readChat(fields);expect(result.warnings).toContain('Fallback (AI quota reached)');expect(transport).toHaveBeenCalledTimes(2);
});
it('never selects an implicit paid endpoint when compatible configuration is incomplete',async()=>{
 setup();vi.stubEnv('LLM_PROVIDER','openai');vi.stubEnv('OPENAI_BASE_URL','');const transport=vi.fn(async()=>compatible());vi.stubGlobal('fetch',transport);
 expect((await serverAdapter().readChat(fields)).source).toBe('fallback');expect(transport).not.toHaveBeenCalled();
});
