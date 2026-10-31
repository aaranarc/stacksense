import type { z } from "zod";
import type { Observation, Safety } from "@stacksense/contracts";

export const EMERGENCY_ACTION = "Isolate water and electricity at the main switch only if safe to reach. Call an emergency electrician/plumber now. Keep away from sagging ceilings.";
const backstop = /spark|socket|switch|light fitting|current|shock|bijli|karant|करंट|बिजली|sagging|bulging|jhuk|gir raha|collapse|gushing|tez paani|flooding|sewage|gutter|naala|मैला|drain overflow/i;

export function safetyOf(observations: Observation[]): z.infer<typeof Safety> {
  const reasons = new Set<string>();
  for (const o of observations) {
    for (const hazard of o.hazards) reasons.add(`${o.id}: ${hazard}`);
    const match = o.rawText.match(backstop);
    if (match) reasons.add(`${o.id}: hazard keyword ${match[0]}`);
  }
  if (reasons.size) return { status: "emergency", reasons: [...reasons], actions: [EMERGENCY_ACTION] };
  if (!observations.length || observations.some(o => !o.hazardQuestionsAnswered)) {
    return { status: "incomplete", reasons: ["Hazard questions unanswered"], actions: [] };
  }
  return { status: "ok", reasons: [], actions: [] };
}
