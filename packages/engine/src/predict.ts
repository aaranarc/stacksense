import {SourceFamily,type EngineState} from "@stacksense/contracts";
import type {Memory} from "./priors/archetypes";
import {claimEvidence} from "./claimEvidence";
import {createGraph} from "./building/graph";
export type MemoryState=EngineState&{memoryPrior?:Memory};
export function predict(state:EngineState,seed:Memory={}):EngineState["prediction"] {
 const memory=Object.fromEntries(SourceFamily.options.map(f=>[f,seed[f]??0]));const seen=new Set<string>();
 for(const o of state.observations)if(o.kind==="professional_finding"&&o.finding&&!seen.has(o.eventKey)){memory[o.finding.family]=(memory[o.finding.family]??0)+1;seen.add(o.eventKey);}
 const evidence=claimEvidence(state),source=state.building.flats.find(f=>f.id===evidence.top?.flatId);
 const victimId=state.hypotheses[0]?.id.split(":")[0],victim=state.building.flats.find(f=>f.id===victimId);
 const professional=state.observations.some(o=>o.kind==="professional_finding"&&o.finding?.family===evidence.top?.family&&o.flatId===source?.id);
 const component=state.hypotheses.some(h=>h.parentId===evidence.top?.id&&(state.posterior[h.id]??0)>=.8)&&state.secondOpinion?.verdict==="no_objection";
 let sameStack:EngineState["prediction"]["sameStack"]=[];
 if(state.safety.status==="ok"&&source&&victim&&(professional||component)) {
  sameStack=createGraph(state.building).sameStack(source).filter(f=>f.id!==victim.id&&(Math.abs(f.floor-source.floor)<=1||Math.abs(f.floor-victim.floor)<=1)&&!state.observations.some(o=>o.flatId===f.id&&(o.kind==="professional_finding"||o.checkId?.startsWith("inspect@"))))
    .map(f=>({flatId:f.id,why:`same stack as ${source.id} wet-area defect — 1-minute inspection photo`}));
 }
 const seasonal=new Set<string>();
 for(const o of state.observations) {
  const flat=state.building.flats.find(f=>f.id===o.flatId);if(!flat)continue;
  if(["window_perimeter","external_wall"].includes(o.zone)&&o.kind==="complaint")for(const wall of flat.externalWalls)seasonal.add(`Before monsoon: check ${wall} window seals on x${flat.position} flats`);
  if(o.kind==="professional_finding"&&o.finding?.family==="upper_wet_area")seasonal.add(`Before monsoon: inspect wet-area seals on x${flat.position} flats`);
 }
 return {...state.prediction,memory,sameStack,seasonal:[...seasonal]};
}
export function localizeComponents(state:EngineState):Record<string,number> {
 const evidence=claimEvidence(state);if(evidence.level!=="component"||!evidence.top)return state.posterior;
 const child=state.hypotheses.find(h=>h.parentId===evidence.top!.id&&(evidence.component?.includes("grout")?h.id.includes("tile_grout"):h.id.includes("nahani_trap")));
 if(!child)return state.posterior;
 // Prototype likelihood of a localized component given specific corroborating evidence.
 return {...state.posterior,[evidence.top.id]:evidence.mass*.1,[child.id]:evidence.mass*.9};
}
