import type { EngineState, Observation } from "@stacksense/contracts";
// Regional prototype defaults; an explicit building setting takes precedence.
export const moistureThresholds={IN:16,UK:16} as const;
const severity:Record<Observation["surface"],number|null>={dry:0,damp_stain:2,efflorescence:3,peeling:4,mould:5,crack:4,active_blistering:6,unclear:null};
const generated=/^looks better ≠ dry$|^recapture worsened|^recurrence at repaired spot|^moisture threshold /;
export function recoveryOf(state:EngineState):EngineState["recovery"] {
  const threshold=state.building.moistureThresholdWme??moistureThresholds[state.building.region];
  const victim=state.hypotheses[0]?.id.split(":")[0];
  const complaint=state.observations.find(o=>o.kind==="complaint"&&o.flatId===victim);
  const source=[...state.hypotheses].filter(h=>!h.parentId).sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0))[0]?.flatId;
  const result:EngineState["recovery"]={repair:"not_started",dry:"unknown",paint:"not_ready",day14DueAt:null,reopened:false,flags:state.recovery.flags.filter(f=>!generated.test(f))};
  if(!complaint) return result;
  let repairAt:number|null=null,lastSurface=severity[complaint.surface];
  const seen=new Set<string>();
  for(const o of [...state.observations].sort((a,b)=>a.at.localeCompare(b.at))) {
    if(seen.has(o.eventKey)) continue;seen.add(o.eventKey);
    const time=Date.parse(o.at);
    if(o.kind==="repair_done"&&(o.flatId===victim||o.flatId===source)) {
      repairAt=time;result.repair="done";result.dry="unknown";result.paint="not_ready";result.reopened=false;
      result.day14DueAt=new Date(time+14*86400000).toISOString();continue;
    }
    if(o.flatId!==victim||o.zone!==complaint.zone) continue;
    if(repairAt!==null&&time>=repairAt) {
      if(o.kind==="recapture") {
        const value=severity[o.surface];
        result.dry="unknown";result.paint="not_ready";
        if(value!==null&&lastSurface!==null&&value>lastSurface) {result.reopened=true;result.flags.push("recapture worsened — investigate again");}
        else if(value!==null&&lastSurface!==null&&value<lastSurface) result.flags.push("looks better ≠ dry");
      }
      if(o.kind==="complaint") {result.reopened=true;result.paint="not_ready";result.dry="unknown";result.flags.push("recurrence at repaired spot — review earlier repair");}
      if(o.kind==="moisture_reading"&&o.moisture?.unit==="%WME"&&Number.isFinite(o.moisture.value)&&o.moisture.value>=0) {
        result.dry=o.moisture.value<=threshold?"dry":"not_dry";
        result.paint=result.dry==="dry"&&!result.reopened?"ready":"not_ready";
        result.flags.push(`moisture threshold ${threshold} %WME — building setting or prototype default; contractor review pending`);
      }
    }
    if(severity[o.surface]!==null) lastSurface=severity[o.surface];
  }
  if(state.safety.status!=="ok"||result.reopened) result.paint="not_ready";
  result.flags=[...new Set(result.flags)];return result;
}
