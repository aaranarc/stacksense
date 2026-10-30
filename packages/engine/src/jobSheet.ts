import { JobSheet, type EngineState } from "@stacksense/contracts";
import { claimEvidence } from "./claimEvidence";
import { tradesFor } from "./tables/trades";
import { responsibilityLinks } from "./tables/responsibility";
const levels={mechanism:0,area:1,component:2} as const;
export function buildJobSheet(state:EngineState):JobSheet|null {
  if(!state.stop.stopped||state.safety.status!=="ok"||state.recovery.reopened) return null;
  const evidence=claimEvidence(state);if(!evidence.top) return null;
  const victimId=state.hypotheses[0]?.id.split(":")[0] ?? "victim";
  const root=evidence.top;
  const uncertain=state.stop.reason?.startsWith("Remote evidence can't decide") ?? false;
  const level=state.secondOpinion && levels[state.secondOpinion.allowedLevel]<levels[evidence.level]?state.secondOpinion.allowedLevel:evidence.level;
  const source=root.flatId ?? root.stackId ?? "source area";
  const unreviewed=!state.secondOpinion||state.secondOpinion.verdict==="review_failed";
  const meterStill=state.observations.some(o=>o.flatId===root.flatId&&o.meter&&o.meter.minutes>0&&o.meter.start===o.meter.end);
  const supply=state.hypotheses.filter(h=>h.family==="upper_supply").reduce((s,h)=>s+(state.posterior[h.id] ?? 0),0);
  const dontSend:JobSheet["dontSend"]=root.family==="upper_wet_area"&&meterStill&&supply<.1?[{trade:"plumber",why:"meter did not move: supply unlikely"}]:[];
  const report=state.observations.filter(o=>o.kind==="complaint"&&o.flatId===victimId).map(o=>o.at).sort()[0] ?? state.now;
  const last=state.observations.map(o=>o.at).sort().at(-1) ?? state.now;
  const areaFlat=state.building.flats.find(f=>f.id===root.flatId);
  const probableSource=uncertain?"Remote evidence insufficient; professional inspection required":state.secondOpinion?.verdict!=="review_failed"&&state.secondOpinion?state.secondOpinion.claim:
    level==="component"?`Probable ${source} ${evidence.component}`:root.label;
  return JobSheet.parse({caseId:state.caseId,region:state.building.region,probableSource,level:uncertain?"mechanism":level,
    send:uncertain?[]:tradesFor(root.family,evidence.component),dontSend,
    access:root.flatId?`Arrange ${areaFlat?.access ?? "unknown"} access to flat ${root.flatId}`:`Coordinate access to ${source} with society/landlord`,
    verifyOnSite:root.family==="upper_wet_area"?[`Professional supervised 24 h flood test of ${source} bathroom`]:[`Professional inspection of ${source}; verify the probable mechanism before repairs`],
    notJustifiedYet:[`breaking ${victimId} ceiling`,"riser replacement","painting before a recorded moisture reading"],
    safetyFlags:[...state.safety.reasons,...(unreviewed?["Second Opinion unavailable — unreviewed"]:[])],
    evidencePhotoIds:[...new Set(state.observations.filter(o=>o.kind!=="complaint"||o.flatId===victimId).flatMap(o=>o.photoIds))],
    responsibilityLinks:responsibilityLinks[state.building.region],
    timestampTrail:[{label:"report received",at:report},{label:"first check requested — request time not recorded",at:"unknown"},{label:"source probable — evidence as of",at:last},{label:"job sheet issued — case time",at:state.now}],
  });
}
