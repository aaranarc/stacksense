'use client';
import { useState } from 'react';
import type { EngineState,Observation } from '@stacksense/contracts';
import { engine } from '../../lib/adapters';
type Props={state:EngineState;onState:(state:EngineState)=>void};
export function WhatIfSliders({state,onState}:Props) {
 const [error,setError]=useState('');
 const controls=[
  {label:'302 duct: dry ↔ wet',find:(o:Observation)=>o.flatId==='302'&&o.zone==='duct_wall',active:(o:Observation)=>o.surface!=='dry',patch:(on:boolean):Partial<Observation>=>({surface:on?'damp_stain':'dry'})},
  {label:'502 meter: still ↔ moved',find:(o:Observation)=>o.flatId==='502'&&o.meter!==null,active:(o:Observation)=>!!o.meter&&o.meter.end>o.meter.start,patch:(on:boolean,o:Observation):Partial<Observation>=>({meter:{start:o.meter!.start,end:o.meter!.start+(on?1:0),minutes:o.meter!.minutes}})},
  {label:'trap grout: cracked ↔ ok',find:(o:Observation)=>o.zone==='trap_grout',active:(o:Observation)=>o.surface==='dry',patch:(on:boolean):Partial<Observation>=>({surface:on?'dry':'crack'})},
  {label:'202 after rain: yes ↔ no',find:(o:Observation)=>o.flatId==='202'&&o.kind==='complaint',active:(o:Observation)=>/no rain|not after rain/i.test(o.rawText),patch:(on:boolean):Partial<Observation>=>({rawText:on?'No rain association reported':'Stain after heavy west-facing rain'})},
 ];
 return <section aria-label="What-if evidence"><p>Change recorded evidence to explore the engine’s decision.</p>{controls.map(control=>{const observation=state.observations.find(control.find);return <label key={control.label} className="whatif-control"><span>{control.label}</span><input type="checkbox" role="switch" aria-label={control.label} disabled={!observation||state.safety.status==='emergency'} checked={observation?control.active(observation):false} onChange={event=>{if(!observation)return;try{setError('');onState(engine.whatIf(state,[{observationId:observation.id,patch:control.patch(event.target.checked,observation)}]));}catch{setError('This evidence could not be changed. Please reload the case.');}}}/>{!observation&&<small>Awaiting this observation</small>}</label>;})}{error&&<p role="alert">{error}</p>}</section>;
}
