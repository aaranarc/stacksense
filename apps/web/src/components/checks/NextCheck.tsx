'use client';
import {useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {createCheckLink,residentApi} from '../../lib/adapters';
import {useCheckLink} from '../phone/PhoneSimulator';
import {WhyDrawer} from './WhyDrawer';
import {Camera,Flag,Link2,ShieldQuestion} from 'lucide-react';
import {colours,tint} from '../../lib/visual';
const labels:Record<string,string>={duct_photo:'duct-wall photo',trap_grout_photo:'trap-grout photo',meter_check:'meter check',ceiling_photo:'ceiling photo'};
export const SAFETY_INCOMPLETE_TEXT='Safety questions unanswered — send the neighbour link, or open Judge Mode → Play to see the full case.';
export function NextCheck({state,onDemoStep:_onDemoStep,onOpenJudge}:{state:EngineState;onDemoStep:()=>void;onOpenJudge?:()=>void}) {
 const [why,setWhy]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[link,setLink]=useState('');
 const open=useCheckLink(),check=state.nextChecks.find(c=>!c.excluded);
 async function sendLink(){if(!check?.targetFlatId)return;setError('');setBusy(true);const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;try{const result=await createCheckLink(state,check.id,check.targetFlatId);const url=new URL(result.waUrl);if(url.protocol!=='https:'||url.hostname!=='wa.me')throw new Error('Invalid sharing link');setLink(result.waUrl);if(popup)popup.location.href=result.waUrl;open(result);}catch{popup?.close();setError('Could not create the check link. Please try again.');}finally{setBusy(false);}}
 const effort=check?(check.effortMin<1?`${Math.round(check.effortMin*60)} s`:`+${check.effortMin} min`):'';
 const answered=state.observations.filter(o=>o.checkId||o.kind==='check_result'||o.kind==='meter_reading').slice(-4);
 const preview=()=>open({token:'demo',url:'/c/demo',waUrl:'https://wa.me/',demo:true});
 const phone=check&&<figure className="phone-mock" aria-label="What the neighbour sees">
  <div className="phone-notch" aria-hidden="true"/>
  <div className="phone-screen"><p className="phone-title">Check request</p><p className="phone-msg">{check.instructions.en}</p><span className="phone-cta" aria-hidden="true"><Camera size={14}/>Open camera</span></div>
  <figcaption>What the neighbour sees{residentApi.isDemo('demo')&&state.safety.status==='ok'&&<> · <button className="link-btn" onClick={preview}>Preview demo phone</button></>}</figcaption>
 </figure>;
 return <div className="next-check">{state.stop.stopped?<><div className="status-row" style={{borderLeftColor:colours.grey,background:tint(colours.grey)}}><Flag size={16} aria-hidden="true"/><p>{state.stop.reason==='emergency'?'Emergency — diagnosis stopped for safety.':state.stop.reason}</p></div>{answered.length>0&&<div className="answered"><span className="eyebrow-strong">Checks answered</span><ul>{answered.map(o=>{const s=o.surface==='dry'||o.meter&&o.meter.end===o.meter.start?colours.green:colours.grey;return <li key={o.id}><span className="icon-tile" aria-hidden="true"><Camera size={15}/></span><span><strong>Flat {o.flatId} · {o.zone.replaceAll('_',' ')}</strong><small>{o.meter?`meter ${o.meter.end===o.meter.start?'did not move':'moved'}`:o.surface.replaceAll('_',' ')} · {new Date(o.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'})}</small></span><i className="answered-dot" style={{background:s}} aria-hidden="true"/></li>;})}</ul></div>}</>
  :check?<><div className="check-head"><span className="eyebrow-strong">Most useful next check</span><span className="effort-chip">{effort}</span></div>
   <div className="check-main"><span className="icon-tile lg" aria-hidden="true"><Camera size={22}/></span><div><h3>{labels[check.type]?labels[check.type]!.charAt(0).toUpperCase()+labels[check.type]!.slice(1):check.type.replaceAll('_',' ')} · Flat {check.targetFlatId}</h3><p>{check.why}</p></div></div>
   <div className="check-actions"><button className="primary" onClick={()=>void sendLink()} disabled={busy||!check.targetFlatId||state.safety.status!=='ok'}><Link2 size={16} aria-hidden="true"/>{busy?'Creating link…':'Send link to neighbour'}</button><button className="ghost-btn" onClick={()=>setWhy(true)}>why? ▸</button></div>
   {link&&<p><a href={link} target="_blank" rel="noopener noreferrer">Open WhatsApp draft</a></p>}{phone}</>
  :state.safety.status==='incomplete'&&state.observations.length?<><div className="status-row" style={{borderLeftColor:colours.amber,background:tint(colours.amber,.12)}}><ShieldQuestion size={16} aria-hidden="true"/><p>{SAFETY_INCOMPLETE_TEXT}</p></div><div className="check-actions"><button className="primary" onClick={preview} disabled={!residentApi.isDemo('demo')}><Link2 size={16} aria-hidden="true"/>Send link to neighbour</button>{onOpenJudge&&<button className="ghost-btn" onClick={onOpenJudge}>Open Judge Mode</button>}</div></>
  :<div className="empty-state"><p>Waiting for case evidence.</p><small>The engine picks the check that tells us most per minute.</small></div>}
  {state.stop.stopped&&state.safety.status==='ok'&&residentApi.isDemo('demo')&&<button className="ghost-btn" onClick={preview}>Preview demo phone</button>}
  {error&&<p role="alert">{error}</p>}{why&&<WhyDrawer state={state} onClose={()=>setWhy(false)}/>}</div>;
}
