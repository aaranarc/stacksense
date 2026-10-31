'use client';
import {useEffect,useRef,useState} from 'react';
import type {ReadResult} from '@stacksense/contracts';
import {getAnswerUpdates,AnswerRefreshError,CHECK_LINK_CREATED} from '../../lib/adapters';
import {DataBadge} from '../states/DataBadge';
export const ANSWER_POLL_MS=10_000;
export const ANSWER_POLL_LIMIT=12;
export function AnswerRefresh({caseId,enabled,onAnswers,demoData=false}:{caseId:string;enabled:boolean;onAnswers:(result:ReadResult)=>number;demoData?:boolean}){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(''),[mode,setMode]=useState<ReadResult['mode']>(),[warnings,setWarnings]=useState<string[]>([]);
 const callback=useRef(onAnswers),manual=useRef<()=>void>(()=>{});callback.current=onAnswers;
 useEffect(()=>{
  setBusy(false);setStatus('');setError('');setMode(undefined);setWarnings([]);if(!enabled)return;
  let active=true,owned=false,budget=0,inFlight=false;let controller:AbortController|null=null;
  async function refresh(automatic=false){
   if(!active||inFlight||(automatic&&(!owned||budget<=0||document.visibilityState==='hidden')))return;
   if(!automatic)budget=ANSWER_POLL_LIMIT;
   budget--;inFlight=true;controller=new AbortController();setBusy(true);setError('');
   try{const result=await getAnswerUpdates(caseId,controller.signal);if(!active||controller.signal.aborted)return;owned=true;const count=callback.current(result);setMode(result.mode);setWarnings(result.warnings.filter(w=>!['Cached','Live','Fallback'].includes(w)));setStatus(count?`Received ${count} neighbour answer${count===1?'':'s'}.`:'No new neighbour answers.');}
   catch(cause){if(!active||controller?.signal.aborted)return;if(cause instanceof AnswerRefreshError&&cause.status===403){owned=false;budget=0;}setError(cause instanceof AnswerRefreshError?cause.message:'Neighbour answers could not be refreshed. Please try again.');}
   finally{inFlight=false;controller=null;if(active)setBusy(false);}
  }
  manual.current=()=>void refresh();
  const linkCreated=(event:Event)=>{if((event as CustomEvent<{caseId:string}>).detail?.caseId!==caseId)return;owned=true;budget=ANSWER_POLL_LIMIT;void refresh(true);};
  const focus=()=>{if(owned&&document.visibilityState!=='hidden'){budget=ANSWER_POLL_LIMIT;void refresh(true);}};
  window.addEventListener(CHECK_LINK_CREATED,linkCreated);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
  const timer=window.setInterval(()=>void refresh(true),ANSWER_POLL_MS);
  return()=>{active=false;controller?.abort();manual.current=()=>{};window.clearInterval(timer);window.removeEventListener(CHECK_LINK_CREATED,linkCreated);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
 },[caseId,enabled]);
 if(!enabled)return null;
 return <section className="answer-refresh" aria-label="Neighbour answers" aria-busy={busy}><div className="tab-actions"><button disabled={busy} onClick={()=>manual.current()}>{busy?'Refreshing answers…':'Refresh neighbour answers'}</button>{mode&&<DataBadge mode={mode} demoData={demoData}/>}</div><p className="diagram-key">Neighbour answers update this case. Refresh when you return.</p>{status&&<p role="status">{status}</p>}{error&&<p role="alert">{error}</p>}{warnings.length>0&&<ul aria-label="Answer warnings">{warnings.map(w=><li key={w}>{w}</li>)}</ul>}</section>;
}
