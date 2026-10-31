import { api,browser } from './adapters';
import {rememberPhoto} from './media';
import type { ReadRequest } from '@stacksense/contracts';
import bundledRequest from '../../public/demo/hero_request.json';
export async function prepareChat(text:string,files:File[],helpers=browser,isDemo=false,buildingId='block-a'):Promise<{request:ReadRequest;warnings:string[]}> {
 const photos:ReadRequest['photos']=[],warnings:string[]=[];
 let messages:ReadRequest['messages']=[];
 try{messages=helpers.pseudonymise(helpers.parseWhatsAppExport(text));if(!messages.length&&text.trim())warnings.push('Preparation warning: no supported chat messages were found.');}catch{warnings.push('Fallback preparation warning: chat could not be prepared; private text was not sent.');if(isDemo){messages=bundledRequest.messages;warnings.push('Demo data: using the bundled sanitised chat after a preparation error.');}}
 for(const [i,file] of files.entries()) {let dataUrl:string;try{dataUrl=await helpers.stripExif(file);}catch{warnings.push(`Preparation warning: photo ${i+1} omitted because metadata could not be removed.`);continue;}try{const quality=await helpers.qualityCheck(dataUrl);warnings.push(...quality.warnings);}catch{warnings.push(`Preparation warning: photo ${i+1} quality was not assessed.`);}const id=`photo-${crypto.randomUUID()}`;messages=messages.map(message=>({...message,attachmentIds:message.attachmentIds.map(attachment=>attachment===file.name?id:attachment)}));rememberPhoto(id,dataUrl);photos.push({id,dataUrl});}
 return {request:{buildingId:isDemo?'block-a':buildingId,messages,photos},warnings:[...new Set(warnings)]};
}
export async function readChat(text:string,files:File[],isDemo=false,buildingId='block-a') {
 const prepared=await prepareChat(text,files,browser,isDemo,buildingId);
 const result=await api.read(prepared.request);
 return {...result,messages:prepared.request.messages,warnings:[...prepared.warnings,...result.warnings]};
}


