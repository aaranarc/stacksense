import { SecondOpinionRequest, SecondOpinion } from "@stacksense/contracts";
import { serverAdapter } from "./llm/server";
import type { LlmAdapter } from "./llm/adapter";
import { jsonBody, jsonResponse, rateLimiter } from "./http/common";
export function createSecondOpinionHandler(opts:{adapter?:LlmAdapter}={}) {
  const allowed=rateLimiter();
  return async(request:Request):Promise<Response>=>{
    if(request.method!=="POST") return jsonResponse(null,405,{Allow:"POST"});
    if(!allowed(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown")) return jsonResponse(null,429,{"Retry-After":"60"});
    try {
      const parsed=SecondOpinionRequest.safeParse(await jsonBody(request,4*1024*1024));
      if(!parsed.success) return jsonResponse(null);
      const {state}=parsed.data;
      const ranked=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id] ?? 0)-(state.posterior[a.id] ?? 0)),top=ranked[0];
      if(!top) return jsonResponse(null);
      const result=await (opts.adapter ?? serverAdapter()).secondOpinion({topHypothesisLabel:top.label,topProbabilityPct:String(Math.round((state.posterior[top.id] ?? 0)*100)),otherHypotheses:JSON.stringify(ranked.slice(1)),observationsJson:JSON.stringify(state.observations),checksJson:JSON.stringify(state.nextChecks)});
      if(!result.data) return jsonResponse(null);
      const opinion=SecondOpinion.safeParse({...result.data,source:"llm"});
      return jsonResponse(opinion.success?opinion.data:null);
    } catch { return jsonResponse(null); }
  };
}
export const handleSecondOpinion=createSecondOpinionHandler();
