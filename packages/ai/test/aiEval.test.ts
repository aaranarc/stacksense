import {expect,it} from "vitest";
import {computeAiMetrics,parseCsv} from "../../../eval/runner-ai/metrics";
import type {ReadResult} from "@stacksense/contracts";
it("A-T25 scores errors, missing hazards, photo abstention and real costs without invented accuracy",()=>{
 const result:ReadResult={observations:[],photoLabels:[{photoId:"clean",surface:"damp_stain",zone:"ceiling",quality:"ok",boxes:[],meterDigits:null,humanCorrected:false}],senderMap:{},warnings:[],mode:"fallback"};
 const metrics=computeAiMetrics([
  {kind:"message",language:"en",expected:{m:{flatId:"402",room:"bathroom",zone:"ceiling",surface:"damp_stain",hazards:["water_near_electrics"],kind:"complaint"}},result,latencyMs:20,costUsd:null},
  {kind:"photo",expected:[{photoId:"clean",surface:"dry",zone:"ceiling",isClean:true}],result,latencyMs:40,costUsd:null},
 ]);
 expect(metrics.f1ByField.flatId).toBe(0);expect(metrics.f1ByField.hazards).toBe(0);expect(metrics.f1ByLanguage.en).toBe(0);
 expect(metrics.photoAccuracy).toBe(0);expect(metrics.cleanWallFalsePositive).toBe(1);expect(metrics.meanLatencyMs).toBe(30);expect(metrics.meanCostPerCaseUsd).toBeNull();
 expect(parseCsv('photoId,path\na,"folder/a,b.jpg"\n')[0]?.path).toBe("folder/a,b.jpg");
});
