import type { EngineState } from '@stacksense/contracts';
import { Drawer } from '../layout/Drawer';
export function SecondOpinionDrawer({state,onClose}:{state:EngineState;onClose:()=>void}) {
 const opinion=state.secondOpinion;
 return <Drawer title="Second Opinion" onClose={onClose}>{opinion?<><p className="chip">{opinion.source==='fallback'?'Fallback':'Live'}</p><p>{opinion.claim}</p>{([['Supports',opinion.supports],['Challenges',opinion.challenges],['Still unknown',opinion.unknown],['What would change this',opinion.wouldChange]] as const).map(([title,items])=><section key={title}><h3>{title}</h3>{items.length?<ul>{items.map(item=><li key={item}>{item}</li>)}</ul>:<p>None recorded.</p>}</section>)}</>:<p>Second Opinion unavailable — treat this result as unreviewed.</p>}</Drawer>;
}
