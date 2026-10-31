import type { z } from 'zod';
import * as realEngine from '@stacksense/engine';
import { ReadResult, SecondOpinion, LinkResult, RainSeries } from '@stacksense/contracts';
import type { EngineState, Observation, ReadRequest, LinkRequest } from '@stacksense/contracts';
import { mockEngine, heroStates, emergencyState } from '../mocks/mockEngine';
import { mockApi } from '../mocks/mockApi';
import { mockBrowser } from '../mocks/browser';
import * as realBrowser from '@stacksense/ai/browser';
import {ResidentCheck,allAnsweredNo,type SafetyAnswers} from './resident';
const USE_MOCK_ENGINE = process.env.NEXT_PUBLIC_USE_MOCK_ENGINE === 'true';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
async function post(path:string,body:unknown):Promise<unknown> {const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok) throw new Error('Request failed. Please try again.');return response.json();}
const realApi={
 async read(request:ReadRequest) {return ReadResult.parse(await post('/api/read',request));},
 async secondOpinion(state:EngineState) {return SecondOpinion.nullable().parse(await post('/api/second-opinion',{state}));},
 async createLink(request:z.infer<typeof LinkRequest>) {return LinkResult.parse(await post('/api/link',request));},
};
export const engine = USE_MOCK_ENGINE ? mockEngine : realEngine;
export const api = USE_MOCK_API ? mockApi : realApi;
export const demo = { states:heroStates, emergency:emergencyState, enabled:USE_MOCK_ENGINE || USE_MOCK_API };
async function fileDataUrl(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read the prepared photo.'));reader.readAsDataURL(file);});}
const liveBrowser={
 available:true,
 parseWhatsAppExport:realBrowser.parseWhatsAppExport,
 pseudonymise:(messages:Parameters<typeof realBrowser.pseudonymise>[0])=>realBrowser.pseudonymise(messages).messages,
 stripExif:async(file:File)=>fileDataUrl(await realBrowser.stripExif(file)),
 async qualityCheck(dataUrl:string){const blob=await(await fetch(dataUrl)).blob();const bitmap=await createImageBitmap(blob);try{const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo quality check unavailable.');ctx.drawImage(bitmap,0,0);const result=realBrowser.qualityCheck(ctx.getImageData(0,0,canvas.width,canvas.height));return {warnings:result.quality==='ok'?[]:[`${result.quality.replaceAll('_',' ')} — ${result.hints.en}`]};}finally{bitmap.close();}},
};
export const browser = USE_MOCK_API?{...mockBrowser,available:true}:liveBrowser;
export async function getRain(state:EngineState):Promise<RainSeries|null>{
 const supplied=(state as EngineState&{weather?:{rain?:RainSeries}}).weather?.rain;if(supplied)return RainSeries.parse(supplied);
 const report=state.observations.find(o=>o.kind==='complaint');if(!report)return null;
 const end=report.at.slice(0,10),start=new Date(Date.parse(report.at)-72*3600000).toISOString().slice(0,10);
 const query=new URLSearchParams({lat:String(state.building.lat),lon:String(state.building.lon),start,end});const response=await fetch(`/api/weather?${query}`);if(!response.ok)throw new Error('Weather data is unavailable.');return RainSeries.parse(await response.json());
}
export function applyRecoveryObservation(state:EngineState,observation:Observation):EngineState {
 if(!USE_MOCK_ENGINE)return realEngine.applyObservations(state,[observation]);
 const observations=[...state.observations,observation];
 const victimId=state.observations.find(o=>o.kind==='complaint')?.flatId;
 const replay=realEngine.applyObservations(realEngine.createCase(state.building,{now:observation.at}),observations.filter(o=>o.kind!=='complaint'||o.flatId===victimId),{photoLabels:state.photoLabels});
 return {...state,now:observation.at,observations,recovery:replay.recovery};
}
export async function createCheckLink(state:EngineState,checkId:string,flatId:string,lang:'en'|'hi'|'mr'='en') {
 const request={caseId:state.caseId,checkId,flatId,lang};
 return USE_MOCK_API?mockApi.createLink(request):LinkResult.parse(await post('/api/link',{...request,state}));
}
const demoLink=(token:string)=>token==='demo'&&(process.env.NEXT_PUBLIC_DEMO_MODE==='true'||USE_MOCK_API);
export async function prepareResidentPhoto(file:File,isDemo=false) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024)throw new Error('Choose a JPG, PNG, or WebP photo up to 4 MB.');
 const cleaned=isDemo?file:await realBrowser.stripExif(file);
 const preview=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not prepare the photo.'));reader.readAsDataURL(cleaned);});
 if(isDemo)return {file:cleaned,preview,quality:'ok' as const,hint:'Demo photo — quality and labels are cached.'};
 const bitmap=await createImageBitmap(cleaned);
 try{const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo preparation is unavailable.');ctx.drawImage(bitmap,0,0);const result=realBrowser.qualityCheck(ctx.getImageData(0,0,canvas.width,canvas.height));return {file:cleaned,preview,quality:result.quality,hint:result.hints.en};}finally{bitmap.close();}
}
export const residentApi={
 isDemo:demoLink,
 async verify(token:string):Promise<ResidentCheck>{
  if(demoLink(token))return {caseId:'hero-04',checkId:'duct-302',flatId:'302',lang:'en',checkType:'duct_photo',instructions:heroStates[4]!.nextChecks[0]!.instructions,ghostPhotoUrl:null};
  if(USE_MOCK_API)throw new Error('Demo mode supports the demo token only.');
  const response=await fetch(`/api/link/verify?token=${encodeURIComponent(token)}`);if(!response.ok)throw new Error(response.status===410?'This link has expired or was already used. Ask for a new link.':'This check is unavailable. Please try again later.');return ResidentCheck.parse(await response.json());
 },
 async upload(input:{token:string;consent:boolean;answers:SafetyAnswers;photo:File;photo2?:File;minutes?:number}) {
  if(!input.consent||!allAnsweredNo(input.answers))throw new Error('Consent and all four negative safety answers are required.');
  if(demoLink(input.token)){const observation=heroStates[5]!.observations.find(o=>o.checkId==='duct-302')!;return ReadResult.parse({observations:[observation],photoLabels:heroStates[5]!.photoLabels.filter(p=>observation.photoIds.includes(p.photoId)),senderMap:{},warnings:['Demo data — no real resident upload or AI interpretation.'],mode:'cached'});}
  if(USE_MOCK_API)throw new Error('Live uploads are disabled in mock mode.');
  const form=new FormData();form.set('token',input.token);form.set('consent','true');form.set('safety',JSON.stringify(input.answers));form.set('photo',input.photo);if(input.photo2)form.set('photo2',input.photo2);if(input.minutes!==undefined)form.set('minutes',String(input.minutes));
  const response=await fetch('/api/upload',{method:'POST',body:form});if(!response.ok)throw new Error(response.status===410?'This link has expired or was already used. Ask for a new link.':'Upload could not be completed. Please retry or ask for a new link.');return ReadResult.parse(await response.json());
 },
};

