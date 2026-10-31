import {Observation} from '@stacksense/contracts';
import {buildings,engine,demo} from './adapters';
export function ukDemo(){
 const source=demo.states[8]!,mapping:Record<string,string>={'402':'4','502':'6','302':'2','202':'1'};
 const observations=source.observations.filter(o=>o.flatId&&mapping[o.flatId]&&o.kind!=='meter_reading').map(o=>Observation.parse({...o,id:`uk-${o.id}`,eventKey:`uk-${o.eventKey}`,flatId:mapping[o.flatId!],sourceMessageIds:[],provenance:'simulated',checkId:o.zone==='duct_wall'?'duct_photo@2':o.zone==='trap_grout'?'trap_grout_photo@6':null,rawText:`UK demo: ${o.rawText}`}));
 observations.push(Observation.parse({...observations[0],id:'uk-finding',eventKey:'uk-finding',flatId:'6',kind:'professional_finding',zone:'trap_grout',surface:'unclear',photoIds:[],sourceMessageIds:[],checkId:null,finding:{family:'upper_wet_area',component:'floor gully grout'},provenance:'simulated',rawText:'Simulated professional finding — wet-area grout route'}));
 return engine.applyObservations(engine.createCase(buildings.UK,{now:source.now}),observations,{photoLabels:source.photoLabels});
}
