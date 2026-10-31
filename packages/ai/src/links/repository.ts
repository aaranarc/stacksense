import {z} from "zod";
import {EngineState,CheckType,Observation,PhotoLabel,ReadResult} from "@stacksense/contracts";
export const LinkRowSchema=z.object({token_hash:z.string(),case_id:z.string(),check_id:z.string(),flat_id:z.string(),lang:z.enum(["en","hi","mr"]),check_type:CheckType,expires_at:z.string(),used_at:z.string().nullable()});
export type LinkRow=z.infer<typeof LinkRowSchema>;
export type PhotoRow={photo_id:string;case_id:string;flat_id:string;check_id:string;zone:string;path:string};
export type StoredRead = Pick<ReadResult,"photoLabels"|"warnings"|"mode">;
const StoredObservation=Observation.extend({photoLabels:PhotoLabel.array().default([]),warnings:z.array(z.string()).default(["Stored legacy answer: photo labels unavailable"]),mode:z.enum(["live","cached","fallback"]).default("fallback")});
export type LinkRepository={getCase(id:string):Promise<EngineState|null>;ownerHash(id:string):Promise<string|null>;putCase(state:EngineState,ownerHash?:string,create?:boolean):Promise<void>;insertLink(row:LinkRow):Promise<void>;getLink(hash:string):Promise<LinkRow|null>;claim(hash:string,at:string):Promise<boolean>;release(hash:string,at:string):Promise<void>;savePhoto(row:PhotoRow,bytes:Uint8Array):Promise<void>;removePhoto(path:string):Promise<void>;saveObservation(caseId:string,obs:Observation,read?:StoredRead):Promise<void>;getUpdates(caseId:string):Promise<ReadResult>;ghost(caseId:string,flatId:string,zone:string):Promise<string|null>;signedUrl(path:string):Promise<string>};
export function supabaseRepository(url:string,key:string,fetcher:typeof fetch=fetch):LinkRepository {
 if(!url.startsWith("https://")||!key)throw new Error("Supabase server credentials required");const base=url.replace(/\/$/,"");
 const headers={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
 const call=async(path:string,init:RequestInit={})=>{const response=await fetcher(base+path,{...init,headers:{...headers,...init.headers},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error("Supabase operation failed");const text=await response.text();return text?JSON.parse(text) as unknown:null;};
 const query=(table:string,params:Record<string,string>)=>`/rest/v1/${table}?${new URLSearchParams(params)}`;
 return {
  async getCase(id){const rows=z.array(z.object({state:EngineState})).parse(await call(query("cases",{id:`eq.${id}`,select:"state",limit:"1"})));return rows[0]?.state??null;},
  async ownerHash(id){const rows=z.array(z.object({owner_hash:z.string().nullable()})).parse(await call(query("cases",{id:`eq.${id}`,select:"owner_hash",limit:"1"})));return rows[0]?.owner_hash??null;},
  async putCase(state,ownerHash,create=true){
   if(!ownerHash)throw new Error("Case owner required");
   await call(create?"/rest/v1/cases":query("cases",{id:`eq.${state.caseId}`,owner_hash:`eq.${ownerHash}`}),{method:create?"POST":"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify(create?{id:state.caseId,building_id:state.building.id,state,owner_hash:ownerHash}:{state})});
  },
  async insertLink(row){await call("/rest/v1/links",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});},
  async getLink(hash){return z.array(LinkRowSchema).parse(await call(query("links",{token_hash:`eq.${hash}`,select:"*",limit:"1"})))[0]??null;},
  async claim(hash,at){const result=await call(query("links",{token_hash:`eq.${hash}`,used_at:"is.null",expires_at:`gt.${at}`}),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({used_at:at})});return z.array(LinkRowSchema).parse(result).length===1;},
  async release(hash,at){await call(query("links",{token_hash:`eq.${hash}`,used_at:`eq.${at}`}),{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({used_at:null})});},
  async savePhoto(row,bytes){await call(`/storage/v1/object/photos/${row.path.split("/").map(encodeURIComponent).join("/")}`,{method:"POST",headers:{"Content-Type":"image/jpeg","x-upsert":"false"},body:Buffer.from(bytes)});await call("/rest/v1/photos",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});},
  async removePhoto(path){await call(query("photos",{path:`eq.${path}`}),{method:"DELETE",headers:{Prefer:"return=minimal"}});await call("/storage/v1/object/photos",{method:"DELETE",body:JSON.stringify({prefixes:[path]})});},
  async getUpdates(caseId){
   const rows=z.array(z.object({payload:StoredObservation})).parse(await call(query("observations",{case_id:`eq.${caseId}`,select:"payload",order:"created_at.asc"})));
   const observations=rows.map(r=>Observation.parse(r.payload)),photoLabels=rows.flatMap(r=>r.payload.photoLabels);
   const fallback=rows.some(r=>r.payload.mode==="fallback");
   return ReadResult.parse({observations,photoLabels,senderMap:{},mode:fallback?"fallback":"cached",warnings:[...new Set([fallback?"Fallback":"Cached",...rows.flatMap(r=>r.payload.warnings.filter(w=>w!=="Live"))])]});
  },
  async saveObservation(caseId,obs,read){await call("/rest/v1/observations",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:obs.id,case_id:caseId,event_key:obs.eventKey,payload:{...obs,...read}})});},
  async ghost(caseId,flatId,zone){const rows=z.array(z.object({path:z.string()})).parse(await call(query("photos",{case_id:`eq.${caseId}`,flat_id:`eq.${flatId}`,zone:`eq.${zone}`,select:"path",order:"created_at.desc",limit:"1"})));return rows[0]?.path??null;},
  async signedUrl(path){const result=z.object({signedURL:z.string()}).parse(await call(`/storage/v1/object/sign/photos/${path.split("/").map(encodeURIComponent).join("/")}`,{method:"POST",body:JSON.stringify({expiresIn:600})}));const signed=result.signedURL;return signed.startsWith("http")?signed:base+(signed.startsWith("/storage/v1/")?signed:"/storage/v1"+signed);},
 };
}
