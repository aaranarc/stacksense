import {z} from "zod";
import {EngineState,CheckType,type Observation} from "@stacksense/contracts";
export const LinkRowSchema=z.object({token_hash:z.string(),case_id:z.string(),check_id:z.string(),flat_id:z.string(),lang:z.enum(["en","hi","mr"]),check_type:CheckType,expires_at:z.string(),used_at:z.string().nullable()});
export type LinkRow=z.infer<typeof LinkRowSchema>;
export type PhotoRow={photo_id:string;case_id:string;flat_id:string;check_id:string;zone:string;path:string};
export type LinkRepository={getCase(id:string):Promise<EngineState|null>;putCase(state:EngineState):Promise<void>;insertLink(row:LinkRow):Promise<void>;getLink(hash:string):Promise<LinkRow|null>;claim(hash:string,at:string):Promise<boolean>;release(hash:string,at:string):Promise<void>;savePhoto(row:PhotoRow,bytes:Uint8Array):Promise<void>;removePhoto(path:string):Promise<void>;saveObservation(caseId:string,obs:Observation):Promise<void>;ghost(caseId:string,flatId:string,zone:string):Promise<string|null>;signedUrl(path:string):Promise<string>};
export function supabaseRepository(url:string,key:string,fetcher:typeof fetch=fetch):LinkRepository {
 if(!url.startsWith("https://")||!key)throw new Error("Supabase server credentials required");const base=url.replace(/\/$/,"");
 const headers={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
 const call=async(path:string,init:RequestInit={})=>{const response=await fetcher(base+path,{...init,headers:{...headers,...init.headers},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error("Supabase operation failed");return response.status===204?null:await response.json() as unknown;};
 const query=(table:string,params:Record<string,string>)=>`/rest/v1/${table}?${new URLSearchParams(params)}`;
 return {
  async getCase(id){const rows=z.array(z.object({state:EngineState})).parse(await call(query("cases",{id:`eq.${id}`,select:"state",limit:"1"})));return rows[0]?.state??null;},
  async putCase(state){await call("/rest/v1/cases",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:state.caseId,building_id:state.building.id,state})});},
  async insertLink(row){await call("/rest/v1/links",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});},
  async getLink(hash){return z.array(LinkRowSchema).parse(await call(query("links",{token_hash:`eq.${hash}`,select:"*",limit:"1"})))[0]??null;},
  async claim(hash,at){const result=await call(query("links",{token_hash:`eq.${hash}`,used_at:"is.null",expires_at:`gt.${at}`}),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({used_at:at})});return z.array(LinkRowSchema).parse(result).length===1;},
  async release(hash,at){await call(query("links",{token_hash:`eq.${hash}`,used_at:`eq.${at}`}),{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({used_at:null})});},
  async savePhoto(row,bytes){await call(`/storage/v1/object/photos/${row.path.split("/").map(encodeURIComponent).join("/")}`,{method:"POST",headers:{"Content-Type":"image/jpeg","x-upsert":"false"},body:Buffer.from(bytes)});await call("/rest/v1/photos",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});},
  async removePhoto(path){await call(query("photos",{path:`eq.${path}`}),{method:"DELETE",headers:{Prefer:"return=minimal"}});await call("/storage/v1/object/photos",{method:"DELETE",body:JSON.stringify({prefixes:[path]})});},
  async saveObservation(caseId,obs){await call("/rest/v1/observations",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:obs.id,case_id:caseId,event_key:obs.eventKey,payload:obs})});},
  async ghost(caseId,flatId,zone){const rows=z.array(z.object({path:z.string()})).parse(await call(query("photos",{case_id:`eq.${caseId}`,flat_id:`eq.${flatId}`,zone:`eq.${zone}`,select:"path",order:"created_at.desc",limit:"1"})));return rows[0]?.path??null;},
  async signedUrl(path){const result=z.object({signedURL:z.string()}).parse(await call(`/storage/v1/object/sign/photos/${path.split("/").map(encodeURIComponent).join("/")}`,{method:"POST",body:JSON.stringify({expiresIn:600})}));const signed=result.signedURL;return signed.startsWith("http")?signed:base+(signed.startsWith("/storage/v1/")?signed:"/storage/v1"+signed);},
 };
}
