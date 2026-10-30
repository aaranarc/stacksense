import type {Building,EngineState,Observation,PhotoLabel,RainSeries,SecondOpinion} from "@stacksense/contracts";
import {blockA} from "../building/blockA";
import {createCase,applyObservations} from "../bayes";
import {applySecondOpinion} from "../secondOpinion";
import {heroSnapshots} from "./hero";
import rainFixture from "../../../../fixtures-ai/weather/hero-rain.simulated.json";
import forecastFixture from "../../../../fixtures-ai/weather/hero-forecast.simulated.json";
export type ScenarioId="happy"|"electrical_hazard"|"locked_502"|"dark_photo"|"beam_travel"|"wrong_trade_rain"|"honest_uncertainty"|"break_it";
export type Scenario={title:string;building:Building;steps:Observation[][];rain?:RainSeries;forecast?:RainSeries;photoLabels?:PhotoLabel[];review?:SecondOpinion|null};
const hero=heroSnapshots(),ledger=hero[9]!.observations;
const first=ledger.find(o=>o.id==="hero-402")!,duct=ledger.find(o=>o.id==="hero-302-duct")!,meter=ledger.find(o=>o.id==="hero-502-meter")!;
const obs=(id:string,patch:Partial<Observation>={}):Observation=>({...structuredClone(first),id,eventKey:id,photoIds:[],rawText:"simulated evidence",...patch});
const locked=structuredClone(blockA);locked.flats.find(f=>f.id==="502")!.access="locked";
export const scenarios:Record<ScenarioId,Scenario>={
 happy:{title:"Hero: evidence before repairs (demo data)",building:blockA,steps:ledger.map(o=>[o]),photoLabels:hero[9]!.photoLabels,review:hero[9]!.secondOpinion},
 electrical_hazard:{title:"Water near electrics (demo data)",building:blockA,steps:[[obs("hazard",{hazards:["water_near_electrics"]})]]},
 locked_502:{title:"502 locked: alternative inspection (demo data)",building:locked,steps:[[first],[duct]]},
 dark_photo:{title:"Dark photo: retake, no inference (demo data)",building:blockA,steps:[[obs("dark",{surface:"unclear",rawText:"photo supplied",photoIds:["dark"]})]],photoLabels:[{photoId:"dark",surface:"damp_stain",zone:"ceiling",quality:"too_dark",boxes:[],meterDigits:null,humanCorrected:false}]},
 beam_travel:{title:"Lateral travel from 501 (demo data)",building:blockA,steps:[[first],[obs("diagonal-finding",{flatId:"501",kind:"professional_finding",zone:"trap_grout",surface:"unclear",finding:{family:"upper_wet_area",component:"tile grout"},rawText:"Professional traced lateral water travel from 501"})]]},
 wrong_trade_rain:{title:"Facade rain, not a supply repair (demo data)",building:blockA,steps:[[obs("rain-report",{flatId:"202",zone:"window_perimeter",surface:"efflorescence",at:rainFixture.hourly.at(-1)!.t,rawText:"Stain at west window after rain"})]],rain:rainFixture as RainSeries,forecast:forecastFixture as RainSeries},
 honest_uncertainty:{title:"Conflicting remote evidence: inspect (demo data)",building:blockA,steps:[[first],[{...duct,surface:"damp_stain",photoIds:[],rawText:"duct wall wet"}],[{...meter,meter:{start:42,end:43,minutes:10},rawText:"meter moved"}]]},
 break_it:{title:"Break it: simulated case seed template",building:blockA,steps:[[obs("break-it-seed")]]},
};
export function runScenario(scenario:Scenario):EngineState {
 let state=createCase(scenario.building,{now:scenario.steps[0]?.[0]?.at??"2026-10-30T16:30:00.000Z"});
 for(const step of scenario.steps)state=applyObservations(state,step,{rain:scenario.rain,forecast:scenario.forecast,photoLabels:scenario.photoLabels});
 return scenario.review?applySecondOpinion(state,scenario.review):state;
}
