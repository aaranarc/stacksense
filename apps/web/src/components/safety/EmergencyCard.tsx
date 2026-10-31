import type { EngineState } from '@stacksense/contracts';
import { visualStatus } from '../../lib/visual';
// Engine reasons are "<observation id>: <hazard>"; show only the human part.
export function humanReason(reason:string){const text=reason.includes(': ')?reason.slice(reason.indexOf(': ')+2):reason;const keyword=/^hazard keyword (.+)$/.exec(text);if(keyword)return `Message mentions “${keyword[1]}”`;const plain=text.replaceAll('_',' ');return plain.charAt(0).toUpperCase()+plain.slice(1);}
export function EmergencyCard({state}:{state:EngineState}) {
 const status=visualStatus('Emergency','red');
 return <section className="panel safety-card" role="alert" style={{borderColor:status.colour,borderWidth:2}}><strong style={{color:status.colour}}>{status.label}</strong><h2>Diagnosis stopped for safety.</h2><ul>{[...new Set(state.safety.reasons.map(humanReason))].map(reason=><li key={reason}>{reason}</li>)}</ul><ul>{state.safety.actions.map(action=><li key={action}>{action}</li>)}</ul></section>;
}
