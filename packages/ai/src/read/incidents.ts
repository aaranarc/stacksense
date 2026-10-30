import type { Observation } from "@stacksense/contracts";
export function assignIncidents(observations: Observation[]): Observation[] {
  const anchors = new Map<string,{at:number;key:string}[]>();
  return [...observations].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id)).map(o=>{
    const group = `${o.flatId ?? `unknown-${o.sourceMessageIds[0] ?? o.id}`}:${o.zone}`;
    const rows = anchors.get(group) ?? []; const time=Date.parse(o.at);
    let anchor = rows.find(a=>Math.abs(time-a.at)<=72*3600000);
    if (!anchor) {anchor={at:time,key:`${group}:${o.at}`};rows.push(anchor);anchors.set(group,rows);}
    return {...o,eventKey:anchor.key};
  });
}
