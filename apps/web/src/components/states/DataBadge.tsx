import type {ReadResult} from '@stacksense/contracts';
export function DataBadge({mode,demoData=false}:{mode?:ReadResult['mode'];demoData?:boolean}){
 const text=mode==='live'?'Live':mode==='cached'?'Cached':mode==='fallback'?'Fallback':'Not read yet';
 return <span className="chip">{text}{demoData?' · Demo data':''}</span>;
}
