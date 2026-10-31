import {randomUUID,randomBytes,timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {EngineState,LinkRequest,LinkResult,ReadResult,type Observation,type PhotoLabel} from "@stacksense/contracts";
import {jsonBody,jsonResponse,rateLimiter} from "../http/common";
import type {LlmAdapter} from "../llm/adapter";
import {preparePhoto} from "../read/photos";
import {createPhotoReader} from "../read/photoCache";
import {createCache} from "../read/cache";
import {serverAdapter} from "../llm/server";
import {modeWarnings} from "../read/status";
import {createTokenCodec} from "./token";
import {supabaseRepository,type LinkRepository,type LinkRow,type PhotoRow} from "./repository";
const Input=LinkRequest.extend({state:EngineState.optional()});
const SafetyAnswers=z.object({water_near_electrics:z.boolean(),sagging_ceiling:z.boolean(),fast_ingress:z.boolean(),sewage:z.boolean()}).strict();
const zoneFor=(kind:string):PhotoLabel["zone"]=>kind==="meter_check"?"meter":kind==="duct_photo"?"duct_wall":kind==="trap_grout_photo"?"trap_grout":kind==="ceiling_photo"?"ceiling":"unclear";
export function createLinkHandlers(opts:{repository:LinkRepository;secret:string;adapter?:LlmAdapter;now?:()=>number;origin?:string}) {
 const now=opts.now??Date.now,codec=createTokenCodec(opts.secret,now),allowed=rateLimiter(),repo=opts.repository;
 const injectedCache=opts.adapter?createCache({bundled:{}}):undefined;
 const checkRate=(r:Request)=>allowed(r.headers.get("x-forwarded-for")??"unknown");
 async function resolve(token:string){const claims=codec.verify(token),row=await repo.getLink(codec.hash(token));if(!row||row.used_at||Date.parse(row.expires_at)<=now()||row.case_id!==claims.caseId||row.check_id!==claims.checkId||row.flat_id!==claims.flatId||row.lang!==claims.lang)throw new Error("Invalid or used token");return row;}
 return {
  async link(request:Request):Promise<Response>{
   if(!checkRate(request))return jsonResponse({error:"Rate limit exceeded"},429);
   try{
    const p=Input.parse(await jsonBody(request,4*1024*1024));
    const existing=await repo.getCase(p.caseId),cookieName=`stacksense_case_${codec.hash(p.caseId).slice(0,24)}`;
    let owner=(request.headers.get("cookie")??"").split(";").map(s=>s.trim()).find(s=>s.startsWith(cookieName+"="))?.slice(cookieName.length+1);
    let ownerHash:string;
    if(existing){const expected=await repo.ownerHash(p.caseId),actual=owner?codec.hash(owner):"";if(!expected||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return jsonResponse({error:"Case owner authorization required"},403);ownerHash=expected;}
    else{owner=randomBytes(32).toString("base64url");ownerHash=codec.hash(owner);}
    const state=p.state??existing;
    if(!state||state.caseId!==p.caseId)return jsonResponse({error:"Case snapshot required"},404);
    if(state.safety.status!=="ok")return jsonResponse({error:"Case is not safe for a resident check"},403);
    const check=state.nextChecks.find(c=>c.id===p.checkId&&c.targetFlatId===p.flatId&&c.excluded===null);
    if(!check)return jsonResponse({error:"Check is unavailable"},400);
    if(p.state)await repo.putCase(state,ownerHash,!existing);
    const token=codec.issue(p),claims=codec.verify(token);
    const row:LinkRow={token_hash:codec.hash(token),case_id:p.caseId,check_id:p.checkId,flat_id:p.flatId,lang:p.lang,check_type:check.type,expires_at:new Date(claims.expiresAt).toISOString(),used_at:null};await repo.insertLink(row);
    const url=`${opts.origin??new URL(request.url).origin}/c/${token}`;
    const messages={en:`Please help check flat ${p.flatId}: ${check.why}. Takes 30 seconds (meter readings take 10 minutes); only if safe. ${url}`,hi:`कृपया फ्लैट ${p.flatId} की जाँच में मदद करें। फोटो में 30 सेकंड लगते हैं; मीटर जाँच में 10 मिनट। सुरक्षित हो तभी करें। ${check.instructions.hi} ${url}`,mr:`कृपया फ्लॅट ${p.flatId} तपासण्यास मदत करा। फोटोला 30 सेकंद लागतात; मीटरला 10 मिनिटे। सुरक्षित असेल तरच करा। ${check.instructions.mr} ${url}`};
    return jsonResponse(LinkResult.parse({url,token,waUrl:`https://wa.me/?text=${encodeURIComponent(messages[p.lang])}`}),200,{"Set-Cookie":`${cookieName}=${owner}; HttpOnly; Secure; SameSite=Strict; Path=/api/link; Max-Age=172800`});
   }catch{return jsonResponse({error:"Link could not be created"},400);}
  },
  async updates(request:Request):Promise<Response>{
   if(!checkRate(request))return jsonResponse({error:"Rate limit exceeded"},429);
   try {
    const caseId=new URL(request.url).searchParams.get("caseId");
    if(!caseId||caseId.length>500)return jsonResponse({error:"Case ID required"},400);
    const name=`stacksense_case_${codec.hash(caseId).slice(0,24)}`;
    const owner=(request.headers.get("cookie")??"").split(";").map(s=>s.trim()).find(s=>s.startsWith(name+"="))?.slice(name.length+1);
    const expected=await repo.ownerHash(caseId),actual=owner?codec.hash(owner):"";
    if(!expected||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return jsonResponse({error:"Case owner authorization required"},403);
    return jsonResponse(ReadResult.parse(await repo.getUpdates(caseId)));
   }catch{return jsonResponse({error:"Case updates unavailable"},503);}
  },
  async verify(request:Request):Promise<Response>{
   if(!checkRate(request))return jsonResponse({error:"Rate limit exceeded"},429);
   try{const row=await resolve(new URL(request.url).searchParams.get("token")??""),state=await repo.getCase(row.case_id);if(!state||state.safety.status!=="ok")return jsonResponse({error:"Resident checks unavailable"},403);const check=state.nextChecks.find(c=>c.id===row.check_id);if(!check||check.excluded!==null)throw new Error();const path=await repo.ghost(row.case_id,row.flat_id,zoneFor(row.check_type));return jsonResponse({caseId:row.case_id,checkId:row.check_id,flatId:row.flat_id,lang:row.lang,checkType:row.check_type,instructions:check.instructions,ghostPhotoUrl:path?await repo.signedUrl(path):null});}catch{return jsonResponse({error:"Invalid, expired or used link"},410);}
  },
  async upload(request:Request):Promise<Response>{
   if(!checkRate(request))return jsonResponse({error:"Rate limit exceeded"},429);
   let row:LinkRow|undefined,claimedAt:string|undefined;const saved:string[]=[];
   try{
    // Bound the actual streamed multipart body, including requests with no Content-Length.
    const reader=request.body?.getReader();if(!reader)throw new Error();let size=0;const chunks:Uint8Array[]=[];
    while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>10*1024*1024){await reader.cancel();return jsonResponse({error:"Upload too large"},413);}chunks.push(item.value);}
    const form=await new Request(request.url,{method:"POST",headers:request.headers,body:Buffer.concat(chunks)}).formData();
    row=await resolve(String(form.get("token")??""));
    const caseState=await repo.getCase(row.case_id);if(!caseState||caseState.safety.status!=="ok"||!caseState.nextChecks.some(c=>c.id===row!.check_id&&c.excluded===null))return jsonResponse({error:"Resident checks unavailable"},403);
    const answers=SafetyAnswers.safeParse(JSON.parse(String(form.get("safety")??"null")));
    if(form.get("consent")!=="true"||!answers.success||Object.values(answers.data).some(Boolean))return jsonResponse({error:"Consent and all four negative safety answers are required; keep away from hazards"},400);
    const files=[form.get("photo"),...(row.check_type==="meter_check"?[form.get("photo2")]:[])];
    if(files.some(f=>!(f instanceof File)||f.size>4*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type)))return jsonResponse({error:"Valid photos up to 4 MB required"},400);
    const minutes=Number(form.get("minutes")??10);if(row.check_type==="meter_check"&&(!Number.isFinite(minutes)||minutes<=0||minutes>1440))return jsonResponse({error:"Invalid meter interval"},400);
    claimedAt=new Date(now()).toISOString();if(!await repo.claim(row.token_hash,claimedAt))return jsonResponse({error:"Link already used"},410);
    const labels:PhotoLabel[]=[],warnings:string[]=[];let fallback=false,allCached=true;
    const readPhoto=createPhotoReader({adapter:opts.adapter??serverAdapter(),cache:injectedCache});
    for(const file of files as File[]){
      const cleaned=await preparePhoto(`data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`),photoId=randomUUID(),path=`${Buffer.from(row.case_id).toString("base64url")}/${photoId}.jpg`;
      const read=await readPhoto({checkType:row.check_type,flatId:row.flat_id,instruction:caseState.nextChecks.find(c=>c.id===row!.check_id)?.instructions[row.lang]??"only if safe",images:[cleaned]});fallback ||= !read.data;allCached &&= read.cached;warnings.push(...read.warnings);
      const label:PhotoLabel={photoId,surface:"unclear",zone:zoneFor(row.check_type),quality:"ok",boxes:[],meterDigits:null,humanCorrected:false,...read.data};labels.push(label);
      const photo:PhotoRow={photo_id:photoId,case_id:row.case_id,flat_id:row.flat_id,check_id:row.check_id,zone:label.zone,path};saved.push(path);await repo.savePhoto(photo,Buffer.from(cleaned.split(",")[1]!,"base64"));
    }
    let meter:Observation["meter"]=null;
    if(row.check_type==="meter_check") {
      const digits=labels.map(p=>p.meterDigits);if(digits.every(d=>d!==null&&/^\d+(?:\.\d+)?$/.test(d))){const start=Number(digits[0]),end=Number(digits[1]);if(Number.isFinite(start)&&Number.isFinite(end)&&end>=start)meter={start,end,minutes};}
      if(!meter){labels.forEach(p=>p.surface="unclear");warnings.push("Meter unreadable: retake both photos; no number was guessed");}
    }
    // A ceiling photo answered after a recorded repair is the Day-14 recapture (recovery reads kind "recapture").
    const recapture=row.check_type==="ceiling_photo"&&caseState.observations.some(o=>o.kind==="repair_done");
    const observation:Observation={id:randomUUID(),flatId:row.flat_id,eventKey:`${row.case_id}:${row.check_id}:${claimedAt}`,at:claimedAt,kind:meter?"meter_reading":recapture?"recapture":"check_result",zone:zoneFor(row.check_type),surface:row.check_type==="meter_check"&&!meter?"unclear":labels[0]!.surface,room:null,hazards:[],hazardQuestionsAnswered:true,checkId:row.check_id,meter,moisture:null,finding:null,photoIds:labels.map(p=>p.photoId),sourceMessageIds:[],provenance:"observed",rawText:row.check_type==="meter_check"?(meter?"Meter readings from two resident photos":"Meter unreadable; retake requested"):recapture?"Resident Day-14 recapture photo received":"Resident check photo received"};
    if(fallback)warnings.push("Labelled fallback: photo labels unavailable; no meter digits were guessed");
    const mode=fallback?"fallback":allCached?"cached":"live";const result=ReadResult.parse({observations:[observation],photoLabels:labels,senderMap:{},warnings:modeWarnings(mode,warnings),mode});await repo.saveObservation(row.case_id,observation,result);return jsonResponse(result);
   }catch{
    if(row&&claimedAt){const cleanup=await Promise.allSettled(saved.map(p=>repo.removePhoto(p)));if(cleanup.every(r=>r.status==="fulfilled"))await repo.release(row.token_hash,claimedAt).catch(()=>{});}
    return jsonResponse({error:row?"Upload failed; retake or request a new link":"Invalid, expired or used link"},row?(claimedAt?503:400):410);
   }
  },
 };
}
let handlers:ReturnType<typeof createLinkHandlers>|undefined;
function configured(){if(!handlers){const {SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,MAGIC_LINK_SECRET:secret}=process.env;if(!url||!key||!secret)throw new Error();handlers=createLinkHandlers({repository:supabaseRepository(url,key),secret,origin:process.env.APP_ORIGIN});}return handlers;}
export async function handleLink(request:Request){try{return await configured().link(request);}catch{return jsonResponse({error:"Configure Supabase and MAGIC_LINK_SECRET"},503);}}
export async function handleLinkVerify(request:Request){try{return await configured().verify(request);}catch{return jsonResponse({error:"Configure Supabase and MAGIC_LINK_SECRET"},503);}}
export async function handleUpload(request:Request){try{return await configured().upload(request);}catch{return jsonResponse({error:"Configure Supabase and MAGIC_LINK_SECRET"},503);}}

export async function handleLinkUpdates(request:Request){try{return await configured().updates(request);}catch{return jsonResponse({error:"Configure Supabase and MAGIC_LINK_SECRET"},503);}}
