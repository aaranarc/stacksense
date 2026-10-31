'use client';
import {useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {createCheckLink} from '../../lib/adapters';
import {useCheckLink} from '../phone/PhoneSimulator';
import {WhyDrawer} from './WhyDrawer';
const labels:Record<string,string>={duct_photo:'duct-wall photo',trap_grout_photo:'trap-grout photo',meter_check:'meter check',ceiling_photo:'ceiling photo'};
export function NextCheck({state,onDemoStep:_onDemoStep}:{state:EngineState;onDemoStep:()=>void}) {
 const [why,setWhy]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[link,setLink]=useState('');
 const open=useCheckLink(),check=state.nextChecks.find(c=>!c.excluded);
 async function sendLink(){if(!check?.targetFlatId)return;setError('');setBusy(true);const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;try{const result=await createCheckLink(state,check.id,check.targetFlatId);const url=new URL(result.waUrl);if(url.protocol!=='https:'||url.hostname!=='wa.me')throw new Error('Invalid sharing link');setLink(result.waUrl);if(popup)popup.location.href=result.waUrl;open(result);}catch{popup?.close();setError('Could not create the check link. Please try again.');}finally{setBusy(false);}}
 return <section className="panel"><h2>Next best check</h2>{state.stop.stopped?<p>{state.stop.reason}</p>:check?<><h3>{check.targetFlatId} {labels[check.type]??check.type.replaceAll('_',' ')} · {check.effortMin<1?`${Math.round(check.effortMin*60)} s`:`${check.effortMin} min`}</h3><p>{check.why}</p><button className="primary" onClick={()=>void sendLink()} disabled={busy||!check.targetFlatId||state.safety.status!=='ok'}>{busy?'Creating link…':'Send link'}</button> <button onClick={()=>setWhy(true)}>why? ▸</button>{link&&<p><a href={link} target="_blank" rel="noopener noreferrer">Open WhatsApp draft</a></p>}</>:<p>Waiting for case evidence.</p>}{error&&<p role="alert">{error}</p>}{why&&<WhyDrawer state={state} onClose={()=>setWhy(false)}/>}</section>;
}
