import {expect,it,vi} from "vitest";
import {readFileSync} from "node:fs";
import {ReadResult,type EngineState,type Observation} from "@stacksense/contracts";
import {createTokenCodec} from "../src/links/token";
import {createLinkHandlers} from "../src/links/http";
import type {LinkRepository,LinkRow,PhotoRow} from "../src/links/repository";
import {createAdapter} from "../src/llm/adapter";
import sharp from "sharp";
const state=JSON.parse(readFileSync(new URL("../../../fixtures/hero/state-05.json",import.meta.url),"utf8")) as EngineState;
function memoryRepository():LinkRepository {
 const owners=new Map<string,string>();const cases=new Map<string,EngineState>(),links=new Map<string,LinkRow>(),photos:PhotoRow[]=[];
 return {async getCase(id){return cases.get(id)??null;},async ownerHash(id){return owners.get(id)??null;},async putCase(s,hash){cases.set(s.caseId,s);owners.set(s.caseId,hash!);},async insertLink(row){links.set(row.token_hash,row);},async getLink(hash){return links.get(hash)??null;},async claim(hash,at){const row=links.get(hash);if(!row||row.used_at)return false;row.used_at=at;return true;},async release(hash,at){const row=links.get(hash);if(row?.used_at===at)row.used_at=null;},async savePhoto(row,_bytes){photos.push(row);},async removePhoto(path){const i=photos.findIndex(p=>p.path===path);if(i>=0)photos.splice(i,1);},async saveObservation(_caseId,_obs){},async ghost(caseId,flatId,zone){return photos.find(p=>p.case_id===caseId&&p.flat_id===flatId&&p.zone===zone)?.path??null;},async signedUrl(path){return `https://private.example.invalid/${path}?signed=test`;}};
}
const secret="test-only-secret-32-characters-long";
const request=(body:unknown)=>new Request("https://demo.example.invalid/api/link",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
it("A-T23 token is signed, expires at 48h and rejects tampering",()=>{
 let now=0;const codec=createTokenCodec(secret,()=>now);const token=codec.issue({caseId:"c",checkId:"meter_check@502",flatId:"502",lang:"en"});
 expect(codec.verify(token).caseId).toBe("c");expect(()=>codec.verify(token+"x")).toThrow();now=48*3600000+1;expect(()=>codec.verify(token)).toThrow();
});
it("A-T23 link -> verify -> two-meter-photo upload is one-use and private",async()=>{
 const repository=memoryRepository();
 const provider=vi.fn().mockResolvedValueOnce({surface:"dry",zone:"meter",boxes:[],meterDigits:"100"}).mockResolvedValueOnce({surface:"dry",zone:"meter",boxes:[],meterDigits:"101"});
 const handlers=createLinkHandlers({repository,secret,adapter:createAdapter({provider})});
 const created=await handlers.link(request({caseId:state.caseId,checkId:"meter_check@502",flatId:"502",lang:"hi",state}));expect(created.status).toBe(200);
 const data=await created.json();expect(data.waUrl).toContain("wa.me");
 const verified=await handlers.verify(new Request(`https://demo.example.invalid/api/link/verify?token=${encodeURIComponent(data.token)}`));expect(verified.status).toBe(200);
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:"white"}}).jpeg().withMetadata().toBuffer();
 const endBytes=await sharp({create:{width:20,height:20,channels:3,background:"grey"}}).jpeg().toBuffer();
 const upload=()=>{const form=new FormData();form.set("token",data.token);form.set("consent","true");form.set("safety",JSON.stringify({water_near_electrics:false,sagging_ceiling:false,fast_ingress:false,sewage:false}));form.set("photo",new File([new Uint8Array(bytes)],"start.jpg",{type:"image/jpeg"}));form.set("photo2",new File([new Uint8Array(endBytes)],"end.jpg",{type:"image/jpeg"}));form.set("minutes","10");return new Request("https://demo.example.invalid/api/upload",{method:"POST",body:form});};
 const response=await handlers.upload(upload());expect(response.status).toBe(200);const result=ReadResult.parse(await response.json());expect(result.observations[0]?.meter).toEqual({start:100,end:101,minutes:10});expect(result.observations[0]?.checkId).toBe("meter_check@502");
 expect((await handlers.upload(upload())).status).toBe(410);
});
it("A-T23 rejects unsafe case links and never guesses unreadable meter digits",async()=>{
 const provider=vi.fn(async()=>({surface:"unclear",zone:"meter",boxes:[],meterDigits:null}));
 const handlers=createLinkHandlers({repository:memoryRepository(),secret,adapter:createAdapter({provider})});
 expect((await handlers.link(request({caseId:state.caseId,checkId:"meter_check@502",flatId:"502",lang:"en",state:{...state,safety:{status:"emergency",reasons:[],actions:[]}}}))).status).toBe(403);
});

it("A-T23 concurrent unreadable meter uploads consume once and return no guessed reading",async()=>{
 const handlers=createLinkHandlers({repository:memoryRepository(),secret,adapter:createAdapter({provider:vi.fn(async()=>({surface:"dry",zone:"meter",boxes:[],meterDigits:"unreadable"}))})});
 const data=await(await handlers.link(request({caseId:state.caseId,checkId:"meter_check@502",flatId:"502",lang:"en",state}))).json();
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:"white"}}).jpeg().toBuffer();
 const upload=()=>{const f=new FormData();f.set("token",data.token);f.set("consent","true");f.set("safety",JSON.stringify({water_near_electrics:false,sagging_ceiling:false,fast_ingress:false,sewage:false}));for(const name of ["photo","photo2"])f.set(name,new File([new Uint8Array(bytes)],"meter.jpg",{type:"image/jpeg"}));return new Request("https://demo.example.invalid/api/upload",{method:"POST",body:f});};
 const responses=await Promise.all([handlers.upload(upload()),handlers.upload(upload())]);
 expect(responses.map(r=>r.status).sort()).toEqual([200,410]);
 const result=await responses.find(r=>r.status===200)!.json();expect(result.observations[0].meter).toBeNull();expect(result.observations[0].surface).toBe("unclear");expect(result.warnings.join(" ")).toContain("retake");
});

it("requires the owner's HttpOnly cookie before replacing an existing case or creating another link",async()=>{
 const handlers=createLinkHandlers({repository:memoryRepository(),secret});
 const body={caseId:state.caseId,checkId:"meter_check@502",flatId:"502",lang:"en",state};
 const first=await handlers.link(request(body));expect(first.status).toBe(200);
 const rejected=await handlers.link(request(body));expect(rejected.status).toBe(403);
 const cookie=first.headers.get("set-cookie")!;expect(cookie).toContain("HttpOnly");
 const own=request(body);own.headers.set("cookie",cookie.split(";")[0]!);expect((await handlers.link(own)).status).toBe(200);
});

it("labels a missing-key photo upload fallback and never invents meter readings",async()=>{
 const handlers=createLinkHandlers({repository:memoryRepository(),secret,adapter:createAdapter()});
 const data=await(await handlers.link(request({caseId:state.caseId,checkId:"meter_check@502",flatId:"502",lang:"en",state}))).json();
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:"white"}}).jpeg().toBuffer();
 const form=new FormData();form.set("token",data.token);form.set("consent","true");form.set("safety",JSON.stringify({water_near_electrics:false,sagging_ceiling:false,fast_ingress:false,sewage:false}));
 for(const name of ["photo","photo2"])form.set(name,new File([new Uint8Array(bytes)],"meter.jpg",{type:"image/jpeg"}));
 const response=await handlers.upload(new Request("https://demo.example.invalid/api/upload",{method:"POST",body:form}));
 expect(response.status).toBe(200);const result=ReadResult.parse(await response.json());
 expect(result.mode).toBe("fallback");expect(result.warnings.join(" ")).toContain("Labelled fallback");expect(result.observations[0]?.checkId).toBe("meter_check@502");expect(result.observations[0]?.meter).toBeNull();
});
