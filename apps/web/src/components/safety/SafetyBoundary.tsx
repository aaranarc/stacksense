import type { ReactNode } from 'react';
import type { EngineState } from '@stacksense/contracts';
import { visualStatus } from '../../lib/visual';
import { EmergencyCard } from './EmergencyCard';
export function SafetyBoundary({state,children}:{state:EngineState;children:ReactNode}) {
 const emergency=state.safety.status==='emergency',incomplete=state.safety.status==='incomplete';
 return <>{emergency&&<EmergencyCard state={state}/>} {incomplete&&<div className="panel safety-card safety-incomplete" role="status" style={{borderColor:visualStatus('Safety incomplete','amber').colour}}>Safety questions unanswered — not marked safe.</div>}<div className={emergency?'boundary diagnosis-stopped':'boundary'} inert={emergency?true:undefined} aria-label={emergency?'Diagnosis stopped for safety':undefined}>{children}</div></>;
}
