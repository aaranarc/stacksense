import { describe, expect, it } from "vitest";
import { HazardType, type Observation } from "@stacksense/contracts";
import { applyObservations, createCase } from "../src/index";
import { safetyOf, EMERGENCY_ACTION } from "../src/safety";
import { blockA } from "../src/building/blockA";
import { observation } from "./helpers";

describe("A-T07 safety first", () => {
  it("gates 1,000 seeded random hazardous observations with 100% emergency", () => {
    let seed = 7107;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
    const kinds: Observation["kind"][] = ["complaint", "denial", "check_result", "repair_done", "recapture"];
    for (let i = 0; i < 1000; i++) {
      const o = observation({ id: `h${i}`, flatId: random() < .2 ? null : "402", kind: kinds[Math.floor(random() * kinds.length)]!,
        hazards: [HazardType.options[Math.floor(random() * HazardType.options.length)]!], hazardQuestionsAnswered: random() > .5 });
      const s = applyObservations(createCase(blockA), [o]);
      expect(s.safety.status).toBe("emergency");
      expect(s.safety.actions).toEqual([EMERGENCY_ACTION]);
      expect(s.nextChecks).toEqual([]);
      expect(s.stop).toEqual({ stopped: true, reason: "emergency" });
      expect(s.jobSheet).toBeNull();
    }
  });
  it.each("spark|socket|switch|light fitting|current|shock|bijli|karant|करंट|बिजली|sagging|bulging|jhuk|gir raha|collapse|gushing|tez paani|flooding|sewage|gutter|naala|मैला|drain overflow".split("|"))("catches keyword %s without AI labels", rawText => {
    expect(safetyOf([observation({ rawText: rawText.toUpperCase() })]).status).toBe("emergency");
  });
  it("keeps unanswered questions incomplete, including an empty case", () => {
    expect(safetyOf([]).status).toBe("incomplete");
    expect(safetyOf([observation({ hazardQuestionsAnswered: false })]).status).toBe("incomplete");
    expect(safetyOf([observation()]).status).toBe("ok");
    expect(applyObservations(createCase(blockA), [observation({ hazardQuestionsAnswered: false })]).nextChecks).toEqual([]);
  });
  it("does not hide a hazard behind duplicate IDs or event keys", () => {
    const s = applyObservations(createCase(blockA), [observation()]);
    const hazard = applyObservations(s, [observation({ rawText: "sparks" })]);
    expect(hazard.safety.status).toBe("emergency");
    expect(applyObservations(hazard, []).safety.status).toBe("emergency");
    expect(hazard.posterior).toEqual(s.posterior);
  });
});
