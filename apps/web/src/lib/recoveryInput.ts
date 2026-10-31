import { Observation } from '@stacksense/contracts';
import type { EngineState } from '@stacksense/contracts';
import { demo } from './adapters';
export function recoveryInput(state:EngineState,kind:'repair_done'|'moisture_reading',value?:number):Observation {
 if(state.safety.status!=='ok')throw new Error('Complete safety questions before recording recovery evidence.');
 if(kind==='moisture_reading'&&(!Number.isFinite(value)||value!<0||value!>100))throw new Error('Enter a moisture reading between 0 and 100 %WME.');
 const victimId=state.hypotheses[0]?.id.split(':')[0];
 const victim=state.observations.find(o=>o.kind==='complaint'&&o.flatId===victimId)??state.observations.find(o=>o.kind==='complaint');
 if(!victim)throw new Error('No affected surface is recorded.');
 const id=`recovery-${crypto.randomUUID()}`,at=new Date(Math.max(Date.now(),Date.parse(state.now),...state.observations.map(o=>Date.parse(o.at)))+1).toISOString();
 return Observation.parse({id,eventKey:id,flatId:victim.flatId,at,kind,zone:victim.zone,surface:'unclear',room:victim.room,hazards:[],hazardQuestionsAnswered:true,checkId:null,meter:null,moisture:kind==='moisture_reading'?{value,unit:'%WME'}:null,finding:null,photoIds:[],sourceMessageIds:[],provenance:demo.enabled?'simulated':'reported',rawText:kind==='repair_done'?'Repair completion recorded by the user':'Moisture reading entered by the user'});
}
