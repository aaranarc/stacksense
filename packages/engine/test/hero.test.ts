import { describe, expect, it } from "vitest";
import { EngineState } from "@stacksense/contracts";
import { heroSnapshots } from "../src/scenarios/hero";
import { splitCases } from "../src/index";

describe("A-T11 hero A9 steps 1–6", () => {
  it("chooses duct then meter, with corresponding shaft/supply drops", () => {
    const s = heroSnapshots();
    expect(s).toHaveLength(12);
    expect(s[1]?.safety.status).toBe("ok");
    expect(s[1]?.nextChecks[0]?.id).toBe("duct_photo@302");
    expect(s[4]?.nextChecks[0]?.id).toBe("duct_photo@302");
    expect(s[5]?.posterior["402:shared_shaft@S-x02"]).toBeLessThan(s[4]!.posterior["402:shared_shaft@S-x02"]! / 10);
    expect(s[5]?.nextChecks[0]?.id).toBe("meter_check@502");
    expect(s[6]?.posterior["402:upper_supply@502"]).toBeLessThan(s[5]!.posterior["402:upper_supply@502"]! / 10);
    expect(s[6]?.posterior["402:upper_wet_area@502"]).toBeGreaterThan(.8);
    expect(s[6]?.stop.stopped).toBe(true);
    expect(s[6]?.observations.find(o => o.flatId === "302")?.surface).toBe("dry");
  });
  it("treats 502 dry tiles weakly and splits 202's facade evidence", () => {
    const s = heroSnapshots();
    const delta = Math.abs(s[4]!.posterior["402:upper_wet_area@502"]! - s[3]!.posterior["402:upper_wet_area@502"]!);
    expect(delta).toBeLessThan(.05);
    const cases = splitCases(s[5]!);
    expect(cases.map(c => c.caseId)).toEqual(["block-a:402", "block-a:202"]);
    expect(cases[1]?.posterior["202:facade_window@202:W"]).toBeGreaterThan(.8);
  });
  it("produces deterministic contract-valid simulated JSON without invented later results", () => {
    const snapshots = heroSnapshots();
    expect(heroSnapshots()).toEqual(snapshots);
    for (const state of snapshots) {
      expect(EngineState.safeParse(JSON.parse(JSON.stringify(state))).success).toBe(true);
      expect(state.observations.every(o => o.provenance === "simulated")).toBe(true);
      if (!state.observations.some(o => o.id === "hero-trap")) expect(state.secondOpinion?.allowedLevel).not.toBe("component");
      if (!state.stop.stopped) expect(state.jobSheet).toBeNull();
      expect(state.recovery.paint).toBe("not_ready");
      if (state.hypotheses.length) expect(Object.values(state.posterior).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12);
    }
    expect(snapshots[3]?.prediction.forecastRechecks.some(c=>c.flatId==="202")).toBe(true);
    expect(snapshots[7]?.secondOpinion?.allowedLevel).toBe("area");
    expect(snapshots[8]?.secondOpinion?.allowedLevel).toBe("component");
    expect(snapshots[9]?.jobSheet?.send.map(t => t.trade)).toContain("waterproofer_tiler");
    expect(snapshots[10]?.recovery.repair).toBe("done");
    expect(snapshots[10]?.recovery.flags).toContain("looks better ≠ dry");
    expect(snapshots[11]?.prediction.sameStack.map(f=>f.flatId)).toEqual(["302","602"]);
    expect(snapshots[11]?.prediction.memory.upper_wet_area).toBe(1);
  });
});
