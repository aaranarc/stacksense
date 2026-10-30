import type { Observation } from "@stacksense/contracts";
export function hazardsIn(text:string): Observation["hazards"] {
  const hazards: Observation["hazards"] = [];
  if (/spark|socket|switch|light fitting|current|shock|bijli|karant|करंट|बिजली/i.test(text)) hazards.push("water_near_electrics");
  if (/sagging|bulging|jhuk|gir raha|collapse/i.test(text)) hazards.push("sagging_ceiling");
  if (/gushing|tez paani|flooding/i.test(text)) hazards.push("fast_ingress");
  if (/sewage|gutter|naala|मैला|drain overflow/i.test(text)) hazards.push("sewage");
  return hazards;
}
