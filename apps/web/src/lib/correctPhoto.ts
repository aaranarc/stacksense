import type { EngineState,PhotoLabel } from '@stacksense/contracts';
import { engine } from './adapters';
export function correctPhoto(state:EngineState,label:PhotoLabel,changed:boolean):EngineState {
 const photoLabels=state.photoLabels.map(p=>p.photoId===label.photoId?{...label,humanCorrected:true}:p);
 return changed?engine.applyObservations(state,state.observations,{photoLabels}):{...state,photoLabels};
}
