import type {ReadResult} from '@stacksense/contracts';
import {QUOTA_WARNING} from '../llm/errors';
export function modeWarnings(mode:ReadResult['mode'],warnings:string[]):string[]{
 const rest=warnings.filter(w=>!['Live','Cached','Fallback',QUOTA_WARNING].includes(w));
 if(mode==='cached'&&warnings.includes(QUOTA_WARNING))rest.unshift('AI quota reached; using validated cached data');
 const label=mode==='cached'?'Cached':mode==='live'?'Live':warnings.includes(QUOTA_WARNING)?QUOTA_WARNING:'Fallback';
 return [...new Set([label,...rest])];
}
