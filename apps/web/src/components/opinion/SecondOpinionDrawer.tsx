import type { EngineState } from '@stacksense/contracts';
import {DataBadge} from '../states/DataBadge';
import { Drawer } from '../layout/Drawer';
export function SecondOpinionDrawer({state,onClose,demoData=false}:{state:EngineState;demoData?:boolean;onClose:()=>void}) {
 const opinion=state.secondOpinion;
 return <Drawer title="Second Opinion" onClose={onClose}>{opinion?<><DataBadge mode={opinion.source==='fallback'?'fallback':'live'} demoData={demoData}/><p>{opinion.claim}</p>{opinion.verdict==='review_failed'&&<p role="status">Evidence listed below is an unreviewed record. It is not a successful AI review.</p>}{([['Supports',opinion.supports],['Challenges',opinion.challenges],['Still unknown',opinion.unknown],['What would change this',opinion.wouldChange]] as const).map(([title,items])=><section key={title}><h3>{title}</h3>{items.length?<ul>{items.map(item=><li key={item}>{item}</li>)}</ul>:<p>None recorded.</p>}</section>)}</>:<p>Second Opinion unavailable — treat this result as unreviewed.</p>}</Drawer>;
}
