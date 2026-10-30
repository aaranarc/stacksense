import { Observation, type EngineState } from "@stacksense/contracts";
import { createCase, applyObservations } from "./bayes";
import { applySecondOpinion } from "./secondOpinion";
export function whatIf(state:EngineState,patches:{observationId:string;patch:Partial<Observation>}[]):EngineState {
  const observations=structuredClone(state.observations),labels=structuredClone(state.photoLabels);
  for(const {observationId,patch} of patches) {
    const matches=observations.map((o,i)=>o.id===observationId?i:-1).filter(i=>i>=0);
    if(!matches.length) throw new Error(`Unknown observation: ${observationId}`);
    for(const i of matches) {
      const parsed=Observation.safeParse({...observations[i],...patch,provenance:"simulated"});
      if(!parsed.success) throw new Error(`Invalid observation patch: ${parsed.error.message}`);
      observations[i]=parsed.data;
      for(const label of labels) if(parsed.data.photoIds.includes(label.photoId)&&label.quality==="ok") {
        if(patch.surface) label.surface=patch.surface;if(patch.zone) label.zone=patch.zone;
      }
    }
  }
  const initial=createCase(state.building,{memory:state.prediction.memory,now:state.now});
  const victim=state.hypotheses[0]?.id.split(":")[0];
  initial.caseId=victim&&state.caseId.endsWith(`:${victim}`)?state.caseId.slice(0,-victim.length-1):state.caseId;
  let replayed=applyObservations(initial,observations,{photoLabels:labels});
  // A previous LLM review evaluated different evidence and must not be presented as current.
  if(state.secondOpinion) replayed=applySecondOpinion(replayed,patches.length?null:state.secondOpinion);
  if(patches.length) replayed={...replayed,recovery:{...replayed.recovery,flags:[...replayed.recovery.flags,"What-if scenario — simulated evidence"]}};
  return replayed;
}
