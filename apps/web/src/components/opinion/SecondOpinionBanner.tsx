'use client';
import { useState } from 'react';
import type { EngineState } from '@stacksense/contracts';
import { api,engine } from '../../lib/adapters';
import { visualStatus } from '../../lib/visual';
import { SecondOpinionDrawer } from './SecondOpinionDrawer';
export function SecondOpinionBanner({state,onState}:{state:EngineState;onState:(state:EngineState)=>void}) {
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const opinion=state.secondOpinion;
 const failed=opinion?.verdict==='review_failed';
 const status=visualStatus('Second Opinion',opinion?.verdict==='objection'?'red':opinion?.verdict==='needs_evidence'?'amber':'grey');
 async function review(){setBusy(true);setError('');try{const draft=await api.secondOpinion(state);onState(engine.applySecondOpinion(state,draft));setOpen(true);}catch{onState(engine.applySecondOpinion(state,null));setError('Second Opinion unavailable — treat this result as unreviewed.');}finally{setBusy(false);}}
 return <section className="panel opinion-line" style={{borderColor:status.colour}}><button className="opinion-button" disabled={busy||state.safety.status==='emergency'} onClick={()=>opinion?setOpen(true):void review()} style={{color:status.colour}}>{busy?'Reading the evidence…':failed?'Second Opinion unavailable — treat this result as unreviewed.':opinion?`⚠ Second Opinion: ${opinion.claim} ▸`:'Second Opinion: request a review ▸'}</button>{opinion&&<small>{opinion.source==='fallback'?'Fallback':'Live'} · {opinion.verdict.replaceAll('_',' ')}</small>}{error&&<p role="alert">{error}</p>}{open&&<SecondOpinionDrawer state={state} onClose={()=>setOpen(false)}/>}</section>;
}
