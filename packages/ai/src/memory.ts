import {z} from "zod";
import {SourceFamily} from "@stacksense/contracts";
import {jsonBody,jsonResponse,rateLimiter} from "./http/common";
const Counts=z.record(SourceFamily,z.number().int().nonnegative());
const Input=z.object({buildingId:z.string().min(1).max(100),family:SourceFamily,eventKey:z.string().min(1).max(200)});
export function createMemoryHandler(opts:{url?:string;key?:string;fetch?:typeof fetch}={}) {
 const local=new Map<string,{counts:Record<string,number>;events:Set<string>}>(),allowed=rateLimiter();
 const blank=()=>Object.fromEntries(SourceFamily.options.map(f=>[f,0]));
 return async(request:Request):Promise<Response>=>{
  if(!allowed(request.headers.get("x-forwarded-for")??"unknown"))return jsonResponse({error:"Rate limit exceeded"},429);
  if(!["GET","POST"].includes(request.method))return jsonResponse({error:"GET or POST required"},405);
  const id=new URL(request.url).searchParams.get("buildingId");let input:z.infer<typeof Input>|undefined;
  try{if(request.method==="POST")input=Input.parse(await jsonBody(request,4096));else if(!id||id.length>100)throw new Error();}catch{return jsonResponse({error:"Invalid memory request"},400);}
  const buildingId=input?.buildingId??id!;
  if(opts.url?.startsWith("https://")&&opts.key)try {
   const headers={apikey:opts.key,Authorization:`Bearer ${opts.key}`,"Content-Type":"application/json"};
   const url=input?`${opts.url}/rest/v1/rpc/record_memory`:`${opts.url}/rest/v1/memory?${new URLSearchParams({building_id:`eq.${buildingId}`,select:"counts",limit:"1"})}`;
   const response=await(opts.fetch??fetch)(url,{method:input?"POST":"GET",headers,...(input?{body:JSON.stringify({p_building_id:buildingId,p_family:input.family,p_event_key:input.eventKey})}:{}),signal:AbortSignal.timeout(3000)});
   if(!response.ok)throw new Error();const data:unknown=await response.json();
   const counts=Counts.parse(input?data:Array.isArray(data)?(data[0] as {counts?:unknown}|undefined)?.counts??blank():null);
   return jsonResponse({counts,fallback:false,storage:"supabase"});
  }catch{/* Explicit browser persistence fallback below. */}
  if(local.size>=500&&!local.has(buildingId))local.delete(local.keys().next().value!);
  const row=local.get(buildingId)??{counts:blank(),events:new Set<string>()};
  if(input&&!row.events.has(input.eventKey)){row.counts[input.family]=(row.counts[input.family]??0)+1;row.events.add(input.eventKey);}
  local.set(buildingId,row);return jsonResponse({counts:row.counts,fallback:true,storage:"localStorage"});
 };
}
let handler:ReturnType<typeof createMemoryHandler>|undefined;
export function handleMemory(request:Request){return(handler??=createMemoryHandler({url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY}))(request);}
