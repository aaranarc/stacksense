import {JobSheet} from '@stacksense/contracts';
import {z} from 'zod';
const Shared=z.object({job:JobSheet.extend({responsibilityLinks:z.array(z.object({label:z.string(),url:z.string().url().refine(value=>{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;},'Only HTTPS responsibility links are allowed.')}))}),demoData:z.boolean()});
export function reportLink(origin:string,state:{jobSheet:JobSheet|null;caseId:string},demoData:boolean):string{
 if(!state.jobSheet)return '';
 const job={...state.jobSheet,caseId:state.caseId,evidencePhotoIds:[]};
 const bytes=new TextEncoder().encode(JSON.stringify({job,demoData}));
 const data=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 return `${origin}/report/${encodeURIComponent(job.caseId)}#${data}`;
}
export function readReport(hash:string){
 if(hash.length>50000)throw new Error('Report is too large.');
 const data=hash.replace(/^#/,'').replaceAll('-','+').replaceAll('_','/');
 return Shared.parse(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(data),c=>c.charCodeAt(0)))));
}
