import { api,browser } from './adapters';
import type { ReadRequest } from '@stacksense/contracts';
export async function prepareChat(text:string,files:File[],helpers=browser):Promise<{request:ReadRequest;warnings:string[]}> {
 const messages=helpers.pseudonymise(helpers.parseWhatsAppExport(text));
 const photos:ReadRequest['photos']=[],warnings:string[]=[];
 for(const [i,file] of files.entries()) {const dataUrl=await helpers.stripExif(file);const quality=await helpers.qualityCheck(dataUrl);photos.push({id:`upload-${i}`,dataUrl});warnings.push(...quality.warnings);}
 return {request:{buildingId:'block-a',messages,photos},warnings:[...new Set(warnings)]};
}
export async function readChat(text:string,files:File[]) {
 // Pass-through preprocessing is authorised for mocks only. Never send it to a real service.
 if(!browser.available) throw new Error('Private browser preparation is unavailable. Use demo mode until it is connected.');
 const prepared=await prepareChat(text,files);
 const result=await api.read(prepared.request);
 return {...result,warnings:[...prepared.warnings,...result.warnings]};
}
