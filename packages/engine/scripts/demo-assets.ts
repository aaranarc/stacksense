import type {EngineState} from "@stacksense/contracts";
import references from "../../../fixtures-ai/photos/demo/assets.json";
type Asset={id:string;path:string;assetSource:string;label:string};
const bindings=references as {label:string;hero:Record<string,Asset>;meters:Asset[];scenarios:Record<string,Asset>};
/** Fixture display metadata only: never changes observations, odds, measured values or provenance. */
export function fixtureDemoAssets(state:EngineState,scenarioId?:string){
 const ids=new Set([...state.observations.flatMap(o=>o.photoIds),...state.photoLabels.map(p=>p.photoId)]);
 return {label:bindings.label,images:Object.fromEntries(Object.entries(bindings.hero).filter(([id])=>ids.has(id))),meterReferences:state.observations.some(o=>o.meter)?bindings.meters:[],preview:scenarioId?bindings.scenarios[scenarioId]??null:null};
}
