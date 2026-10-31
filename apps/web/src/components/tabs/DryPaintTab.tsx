'use client';
import {useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {applyRecoveryObservation,createCheckLink} from '../../lib/adapters';
import {recoveryInput} from '../../lib/recoveryInput';
import {visualStatus} from '../../lib/visual';
import {GhostCompare} from '../photo/GhostCompare';
import {useCheckLink} from '../phone/PhoneSimulator';
export function DryPaintTab({state,onState}:{state:EngineState;onState:(state:EngineState)=>void}) {
 const [value,setValue]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const open=useCheckLink();
 const r=state.recovery;
 const lastReading=state.observations.filter(o=>o.kind==='moisture_reading').at(-1);
 const repair=state.observations.filter(o=>o.kind==='repair_done').at(-1);
 const stamp=(at:string|undefined)=>at?new Date(at).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}):'';
 const pill=(label:string,done:boolean,at:string|undefined)=>{const s=visualStatus(`${label}${done&&at?` · ${stamp(at)}`:''}`,done&&at?'green':'grey');return <span className="chip" style={{color:s.colour}}>{s.label}</span>;};
 const check=state.nextChecks.find(c=>!c.excluded&&c.type==='ceiling_photo');
 async function send(){if(!check?.targetFlatId)return;setBusy(true);try{const result=await createCheckLink(state,check.id,check.targetFlatId);window.open(result.waUrl,'_blank','noopener,noreferrer');open(result);}catch{setError('Could not create the recapture link. Please try again.');}finally{setBusy(false);}}
 function record(kind:'repair_done'|'moisture_reading'){try{setError('');onState(applyRecoveryObservation(state,recoveryInput(state,kind,kind==='moisture_reading'?Number(value):undefined)));}catch(e){setError(e instanceof Error?e.message:'Could not record the evidence.');}}
 return <section><div className="recovery-pills">{pill(`Repair · ${r.repair.replaceAll('_',' ')}`,r.repair==='done',repair?.at)}{pill(`Dry · ${r.dry.replaceAll('_',' ')}`,r.dry==='dry',lastReading?.at)}{pill(`Ready to paint · ${r.paint==='ready'?'ready':'not ready'}`,r.paint==='ready',lastReading?.at)}</div><p>Looks better ≠ dry. Only a moisture reading can mark this ready to paint.</p>{r.reopened&&<p role="alert">Case reopened — investigate the worsening surface before painting.</p>}<section className="recapture-card"><h3>Day-14 recapture</h3><p>{r.day14DueAt?`Due ${new Date(r.day14DueAt).toLocaleDateString('en-GB',{timeZone:'UTC'})}`:'Record the repair to schedule a recapture.'}</p><button onClick={()=>void send()} disabled={busy||!check||state.safety.status!=='ok'}>Send link</button>{!check&&<p className="diagram-key">No recapture check is currently available from the engine.</p>}</section><GhostCompare state={state}/>{r.repair!=='done'&&<button disabled={state.safety.status!=='ok'} onClick={()=>record('repair_done')}>Record repair completed</button>}<form onSubmit={e=>{e.preventDefault();record('moisture_reading');}}><label>Moisture reading<input aria-label="Moisture reading" type="number" min="0" max="100" step="0.1" required value={value} onChange={e=>setValue(e.target.value)}/></label><label>Unit<select aria-label="Moisture unit" value="%WME" onChange={()=>{}}><option>%WME</option></select></label><button className="primary" disabled={state.safety.status!=='ok'||r.repair!=='done'||value===''}>Record moisture reading</button></form>{r.flags.length>0&&<ul aria-label="Recovery flags">{r.flags.filter(flag=>flag!=='Looks better ≠ dry. Only a moisture reading can mark this ready to paint.').map(flag=><li key={flag}>{flag}</li>)}</ul>}{error&&<p role="alert">{error}</p>}</section>;
}



