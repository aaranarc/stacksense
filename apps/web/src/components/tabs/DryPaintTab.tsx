'use client';
import {useId,useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {applyRecoveryObservation,createCheckLink} from '../../lib/adapters';
import {recoveryInput} from '../../lib/recoveryInput';
import {visualStatus} from '../../lib/visual';
import {GhostCompare} from '../photo/GhostCompare';
import {photoMedia} from '../../lib/media';
import {moistureThresholds} from '@stacksense/engine';
import {Check,Droplet} from 'lucide-react';
import {useCheckLink} from '../phone/PhoneSimulator';
export function DryPaintTab({state,onState}:{state:EngineState;onState:(state:EngineState)=>void}) {
 const [value,setValue]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const open=useCheckLink(),inputId=useId();
 const r=state.recovery;
 const lastReading=state.observations.filter(o=>o.kind==='moisture_reading').at(-1);
 const repair=state.observations.filter(o=>o.kind==='repair_done').at(-1);
 const stamp=(at:string|undefined)=>at?new Date(at).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}):'';
 const pill=(label:string,done:boolean,at:string|undefined)=>{const s=visualStatus(`${label}${done&&at?` · ${stamp(at)}`:''}`,done&&at?'green':'grey');return <span className="chip" style={{borderColor:s.colour}}>{s.label}</span>;};
 const check=state.nextChecks.find(c=>!c.excluded&&c.type==='ceiling_photo');
 async function send(){if(!check?.targetFlatId)return;setBusy(true);setError('');try{const result=await createCheckLink(state,check.id,check.targetFlatId);window.open(result.waUrl,'_blank','noopener,noreferrer');open(result);}catch{setError('Could not create the recapture link. Please try again.');}finally{setBusy(false);}}
 function record(kind:'repair_done'|'moisture_reading'){try{setError('');onState(applyRecoveryObservation(state,recoveryInput(state,kind,kind==='moisture_reading'?Number(value):undefined)));}catch(e){setError(e instanceof Error?e.message:'Could not record the evidence.');}}
 const victim=state.observations.filter(o=>o.kind==='complaint'&&o.photoIds.length).sort((a,b)=>a.at.localeCompare(b.at))[0];
 const recaptures=state.observations.filter(o=>o.kind==='recapture'&&o.photoIds.length).sort((a,b)=>a.at.localeCompare(b.at));
 const afterRepair=repair?recaptures.find(o=>o.at>=repair.at&&o!==recaptures.at(-1)):undefined,day14=recaptures.at(-1);
 const steps=[
  {key:'repair',label:`Repair · ${r.repair.replaceAll('_',' ')}`,done:r.repair==='done',at:repair?.at},
  {key:'dry',label:`Dry · ${r.dry.replaceAll('_',' ')}`,done:r.dry==='dry',at:lastReading?.at},
  {key:'paint',label:`Ready to paint · ${r.paint==='ready'?'ready':'not ready'}`,done:r.paint==='ready',at:lastReading?.at},
 ];
 const current=steps.findIndex(s=>!s.done);
 const tile=(title:string,o:typeof victim,ghost=false)=>{const m=o&&photoMedia(o.photoIds[0]!);return <figure className="photo-tile"><figcaption>{title}</figcaption>{m?<div className={`photo-frame${ghost?' ghost':''}`}><img src={m.url} alt={`${title} photo, flat ${o!.flatId}`}/>{ghost&&<span className="ghost-outline" aria-hidden="true"/>}</div>:<div className="photo-frame empty">No photo yet</div>}<small>{o?stamp(o.at):ghost?'Ghost outline aligns the recapture':'—'}</small></figure>;};
 const threshold=moistureThresholds[state.building.region];
 return <section className="recovery">
  <ol className="stepper" aria-label="Repair, dry and paint status">{steps.map((s,i)=>{const st=visualStatus(s.label,s.done&&s.at?'green':'grey');return <li key={s.key} className={s.done?'done':i===current?'current':undefined}><span className="step-circle" style={s.done?{background:st.colour,borderColor:st.colour}:undefined} aria-hidden="true">{s.done?<Check size={14}/>:i+1}</span><span className="step-text"><strong>{s.label}</strong><small>{s.done&&s.at?stamp(s.at):i===current?(i===0?'Not recorded yet':i===1?'Needs a moisture reading':'Needs a dry reading'):'Pending'}</small></span></li>;})}</ol>
  <p className="note">Looks better ≠ dry. Only a moisture reading can mark this ready to paint.</p>
  {r.reopened&&<p role="alert">Case reopened — investigate the worsening surface before painting.</p>}
  <div className="recovery-grid">
   <div className="photo-row">{tile('Before',victim)}{tile('After repair',afterRepair)}{tile('Day 14 check',day14,true)}</div>
   <div className="moisture-card">
    <span className="eyebrow-strong">Moisture reading</span>
    <div className="moisture-value"><Droplet size={22} aria-hidden="true"/><strong>{lastReading?.moisture?`${lastReading.moisture.value}%`:'No reading yet'}</strong><span>Target ≤ {threshold} %WME</span></div>
    <form onSubmit={e=>{e.preventDefault();record('moisture_reading');}}><label className="sr-only" htmlFor={inputId}>Moisture reading</label><input id={inputId} aria-label="Moisture reading" type="number" min="0" max="100" step="0.1" required value={value} placeholder="%WME" onChange={e=>setValue(e.target.value)}/><select aria-label="Moisture unit" value="%WME" onChange={()=>{}}><option>%WME</option></select><button className="outline-btn" disabled={state.safety.status!=='ok'||r.repair!=='done'||value===''}>Add reading</button></form>
    <small>Threshold set by contractor configuration; prototype review pending.</small>
   </div>
  </div>
  <div className="recovery-actions">{r.repair!=='done'&&<button className="outline-btn" disabled={state.safety.status!=='ok'} onClick={()=>record('repair_done')}>Record repair completed</button>}<span className="recapture-note"><strong>Day-14 recapture</strong> {r.day14DueAt?`due ${new Date(r.day14DueAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}`:'· record the repair to schedule it'}</span><button className="ghost-btn" onClick={()=>void send()} disabled={busy||!check||state.safety.status!=='ok'}>{busy?'Creating link…':'Send recapture link'}</button></div>
  {!check&&r.repair==='done'&&<p className="diagram-key">No recapture check is currently available from the engine.</p>}
  <GhostCompare state={state}/>
  {r.flags.length>0&&<ul className="flags" aria-label="Recovery flags">{r.flags.filter(flag=>flag!=='Looks better ≠ dry. Only a moisture reading can mark this ready to paint.').map(flag=><li key={flag}>{flag}</li>)}</ul>}{error&&<p role="alert">{error}</p>}
 </section>;
}
