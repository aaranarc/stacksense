import { describe, expect, it } from "vitest";
import { applyObservations, createCase } from "../src/index";
import { stopRule } from "../src/stop";
import { traceStep } from "../src/trace";
import { blockA } from "../src/building/blockA";
import { observation } from "./helpers";

describe("A-T10 stop and trace", () => {
  it("stops at 80% unless the reviewer objects", () => {
    const s = applyObservations(createCase(blockA), [observation()]);
    const high = { ...s, posterior: { "402:upper_wet_area@502": .8, "402:upper_supply@502": .2 } };
    expect(stopRule(high).stopped).toBe(true);
    const objection = { verdict: "objection" as const, allowedLevel: "area" as const, claim: "Probable area", supports: [], challenges: [], unknown: [], wouldChange: [], source: "fallback" as const };
    expect(stopRule({ ...high, secondOpinion: objection }).stopped).toBe(false);
  });
  it("requests inspection for low-value checks, without declaring a source", () => {
    const s = applyObservations(createCase(blockA), [observation()]);
    const low = { ...s, nextChecks: s.nextChecks.map(c => ({ ...c, score: .049 })) };
    expect(stopRule(low)).toEqual({ stopped: true, reason: "Remote evidence can't decide — inspect 502" });
    expect(stopRule({ ...low, safety: { status: "incomplete", reasons: [], actions: [] } }).stopped).toBe(false);
    expect(stopRule({ ...low, safety: { status: "emergency", reasons: [], actions: [] } })).toEqual({ stopped: true, reason: "emergency" });
    expect(stopRule(createCase(blockA)).stopped).toBe(false);
    const roofKey = Object.keys(low.posterior).find(k => k.endsWith(":roof_terrace"))!;
    const roof = { ...low, caseId: "sim-23-96446053-82bf:401", posterior: Object.fromEntries(Object.keys(low.posterior).map(k => [k, k === roofKey ? .6 : .4 / (Object.keys(low.posterior).length - 1)])) };
    expect(stopRule(roof)).toEqual({ stopped: true, reason: "Remote evidence can't decide — inspect 401" });
  });
  it("keeps the 80% source threshold invariant when mass is localized to a component", () => {
    const state=applyObservations(createCase(blockA),[observation()]);
    const area=state.hypotheses.find(h=>h.family==="upper_wet_area"&&!h.parentId)!;
    const child=state.hypotheses.find(h=>h.parentId===area.id)!;
    const other=state.hypotheses.find(h=>h.family==="upper_supply")!;
    const localized={...state,posterior:{[area.id]:.08,[child.id]:.72,[other.id]:.2},nextChecks:[]};
    expect(stopRule(localized).reason).toContain("80%");
    const objection={verdict:"objection" as const,allowedLevel:"area" as const,claim:"Contradiction",supports:[],challenges:[],unknown:[],wouldChange:[],source:"fallback" as const};
    expect(stopRule({...localized,secondOpinion:objection,nextChecks:[{...state.nextChecks[0]!,excluded:null,score:.05}]}).stopped).toBe(false);
    expect(stopRule({...localized,secondOpinion:objection}).reason).toContain("inspect 502");
  });
  it("continues at exactly .05 and inspects below .05 without inventing confidence",()=>{
    const state=applyObservations(createCase(blockA),[observation()]);
    const checks=[{...state.nextChecks[0]!,excluded:null,score:.05}];
    expect(stopRule({...state,nextChecks:checks}).stopped).toBe(false);
    expect(stopRule({...state,nextChecks:[{...checks[0]!,score:.049}]}).reason).toContain("inspect");
    expect(stopRule({...state,nextChecks:[{...checks[0]!,excluded:"flat locked",score:1}]}).reason).toContain("inspect");
  });
  it("records only changes over one percentage point with evidence reasons", () => {
    const s = applyObservations(createCase(blockA), [observation()]);
    expect(s.trace.length).toBeGreaterThan(0);
    expect(s.trace[0]?.observationId).toBe("o1");
    expect(s.trace.flatMap(t => t.changes).every(c => Math.abs(c.after - c.before) > .01 && c.why.includes("ceiling under wet area"))).toBe(true);
    expect(applyObservations(s, [observation({ id: "duplicate" })]).trace).toEqual(s.trace);
    const h = s.hypotheses.find(x => x.family === "upper_supply")!;
    const step = traceStep({ [h.id]: .2 }, { [h.id]: .205 }, [h], "o", ["meter_still"], 1);
    expect(step.changes).toEqual([]);
  });
});
