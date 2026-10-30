import {describe,expect,it} from "vitest";
import type {RainSeries} from "@stacksense/contracts";
import {rainFeature,forecastRechecks,windDrivenRain} from "../src/rain";
import {createCase,applyObservations} from "../src/index";
import {blockA} from "../src/building/blockA";
import {observation} from "./helpers";
import rainFixture from "../../../fixtures-ai/weather/hero-rain.simulated.json";
import forecastFixture from "../../../fixtures-ai/weather/hero-forecast.simulated.json";
const rain=rainFixture as RainSeries;
const obs=observation({flatId:"202",zone:"window_perimeter",surface:"efflorescence",at:rain.hourly.at(-1)!.t,rawText:"west window stain after rain"});
describe("A-T19 rain join",()=>{
 it("uses wall-facing wind and the prior 72 hours without future leakage",()=>{
  expect(windDrivenRain(rain.hourly.at(-1)!,"W")).toBe(50);expect(windDrivenRain(rain.hourly.at(-1)!,"E")).toBe(0);
  expect(rainFeature(obs,blockA,rain)).toBe("follows_rain_on_facade");
  expect(rainFeature({...obs,at:"2026-10-01T00:00:00.000Z"},blockA,rain)).toBeNull();
 });
 it("joins automatically and preserves weather when more observations arrive",()=>{
  const s=applyObservations(createCase(blockA),[obs],{rain});
  expect(s.trace.flatMap(t=>t.changes).some(c=>c.why.includes("follows rain on facade"))).toBe(true);
  expect(applyObservations(s,[]).posterior).toEqual(s.posterior);
 });
 it("selects the first above-percentile heavy-rain forecast day",()=>{
  const forecast=forecastFixture as RainSeries;
  const s=applyObservations(createCase(blockA,{now:"2026-10-30T00:00:00.000Z"}),[obs],{rain,forecast});
  expect(forecastRechecks(s,forecast)[0]).toMatchObject({flatId:"202",orientation:"W",afterDate:"2026-11-03"});
  expect(s.prediction.forecastRechecks[0]?.flatId).toBe("202");
 });
});
