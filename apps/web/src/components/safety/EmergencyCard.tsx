import type { EngineState } from '@stacksense/contracts';
import { visualStatus } from '../../lib/visual';
export function EmergencyCard({state}:{state:EngineState}) {
 const status=visualStatus('Emergency','red');
 return <section className="panel safety-card" role="alert" style={{borderColor:status.colour,borderWidth:2}}><strong style={{color:status.colour}}>{status.label}</strong><h2>Diagnosis stopped for safety.</h2><ul>{state.safety.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul><ul>{state.safety.actions.map(action=><li key={action}>{action}</li>)}</ul></section>;
}
