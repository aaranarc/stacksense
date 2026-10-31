import { EngineState } from '@stacksense/contracts';
export function saveCase(state:EngineState,demoData=state.observations.some(o=>o.provenance==='simulated'),storage:Pick<Storage,'setItem'>=sessionStorage){storage.setItem(`stacksense:${state.caseId}`,JSON.stringify(state));storage.setItem(`stacksense:display:${state.caseId}`,JSON.stringify({demoData}));}
export function loadCase(id:string):EngineState|null{try{const raw=sessionStorage.getItem(`stacksense:${id}`);return raw?EngineState.parse(JSON.parse(raw)):null;}catch{return null;}}
// Decode only at the route boundary; storage keys always use the original case ID.
export function loadCaseFromRoute(segment:string):EngineState|null{try{return loadCase(decodeURIComponent(segment));}catch{return null;}}
export function loadCaseDemoFromRoute(segment:string):boolean|undefined{try{const raw=sessionStorage.getItem(`stacksense:display:${decodeURIComponent(segment)}`);if(!raw)return undefined;const value=JSON.parse(raw);return typeof value.demoData==='boolean'?value.demoData:undefined;}catch{return undefined;}}
