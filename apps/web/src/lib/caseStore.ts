import { EngineState } from '@stacksense/contracts';
export function saveCase(state:EngineState){sessionStorage.setItem(`stacksense:${state.caseId}`,JSON.stringify(state));}
export function loadCase(id:string):EngineState|null{try{const raw=sessionStorage.getItem(`stacksense:${id}`);return raw?EngineState.parse(JSON.parse(raw)):null;}catch{return null;}}
// Decode only at the route boundary; storage keys always use the original case ID.
export function loadCaseFromRoute(segment:string):EngineState|null{try{return loadCase(decodeURIComponent(segment));}catch{return null;}}
