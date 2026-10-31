import { EngineState } from '@stacksense/contracts';
export function saveCase(state:EngineState){sessionStorage.setItem(`stacksense:${state.caseId}`,JSON.stringify(state));}
export function loadCase(id:string):EngineState|null{try{const raw=sessionStorage.getItem(`stacksense:${id}`);return raw?EngineState.parse(JSON.parse(raw)):null;}catch{return null;}}
