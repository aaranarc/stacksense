import { EngineState } from '@stacksense/contracts';
import type { Building, Observation, PhotoLabel, RainSeries, SecondOpinion } from '@stacksense/contracts';
import s00 from './states/state-00.json';
import s01 from './states/state-01.json';
import s02 from './states/state-02.json';
import s03 from './states/state-03.json';
import s04 from './states/state-04.json';
import s05 from './states/state-05.json';
import s06 from './states/state-06.json';
import s07 from './states/state-07.json';
import s08 from './states/state-08.json';
import s09 from './states/state-09.json';
import s10 from './states/state-10.json';
import s11 from './states/state-11.json';
import moved from './states/state-whatif-meter-moved.json';
import corrected from './states/state-photo-corrected.json';
import emergency from './states/state-emergency.json';
export const heroStates=[s00,s01,s02,s03,s04,s05,s06,s07,s08,s09,s10,s11].map(s=>EngineState.parse(s));
export const emergencyState=EngineState.parse(emergency);
export const mockEngine={
 createCase(building:Building,opts?:{memory?:EngineState['prediction']['memory'];now?:string}):EngineState { return EngineState.parse({...heroStates[0],building,now:opts?.now??heroStates[0]!.now}); },
 applyObservations(state:EngineState,obs:Observation[],ctx?:{rain?:RainSeries;forecast?:RainSeries;photoLabels?:PhotoLabel[]}):EngineState {
  if(obs.some(o=>o.hazards.length)) return structuredClone(emergencyState);
  if(ctx?.photoLabels?.some(p=>p.humanCorrected && p.surface!=='crack' && p.photoId==='P502')) return EngineState.parse({...corrected,photoLabels:ctx.photoLabels,observations:obs});
  const i=heroStates.findIndex(s=>s.caseId===state.caseId);
  const next=structuredClone(heroStates[Math.min(Math.max(i,0)+1,11)]!);
  // Sender remapping updates the matching event without duplicating it.
  next.observations=next.observations.map(o=>obs.find(incoming=>incoming.id===o.id)??o);
  for(const o of obs) if(!next.observations.some(existing=>existing.id===o.id)) next.observations.push(o);
  if(ctx?.photoLabels) next.photoLabels=ctx.photoLabels;
  return next;
 },
 applySecondOpinion(state:EngineState,draft:SecondOpinion|null):EngineState {return {...state,secondOpinion:draft};},
 whatIf(_state:EngineState,_patches:{observationId:string;patch:Partial<Observation>}[]):EngineState {return EngineState.parse(moved);},
 scenarios:{happy:{title:'Happy path',building:heroStates[0]!.building,steps:heroStates.slice(1).map(s=>s.observations)}},
};
