import type {EngineState,ReadResult} from '@stacksense/contracts';
import {engine} from './adapters';
export function answerDelta(state:EngineState,result:ReadResult):ReadResult{
 const seen=new Set(state.observations.map(o=>o.id));
 const observations=[...new Map(result.observations.filter(o=>!seen.has(o.id)).map(o=>[o.id,o])).values()];
 const photos=new Set(observations.flatMap(o=>o.photoIds));
 const corrected=new Set(state.photoLabels.filter(p=>p.humanCorrected).map(p=>p.photoId));
 return {...result,observations,photoLabels:result.photoLabels.filter(p=>photos.has(p.photoId)&&!corrected.has(p.photoId))};
}
export function applyResidentAnswers(state:EngineState,result:ReadResult):EngineState{
 const delta=answerDelta(state,result);if(!delta.observations.length)return state;
 const now=new Date(Math.max(Date.parse(state.now),...delta.observations.map(o=>Date.parse(o.at)))).toISOString();
 return engine.applyObservations({...state,now},delta.observations,{photoLabels:delta.photoLabels});
}
export function mergeAnswerRead(previous:ReadResult|null,result:ReadResult):ReadResult{
 return {...result,senderMap:{...previous?.senderMap,...result.senderMap},warnings:[...new Set([...(previous?.warnings??[]),...result.warnings])],observations:[...new Map([...(previous?.observations??[]),...result.observations].map(o=>[o.id,o])).values()],photoLabels:[...new Map([...(previous?.photoLabels??[]),...result.photoLabels].map(p=>[p.photoId,p])).values()]};
}
