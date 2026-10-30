import {Building,SourceFamily,type Observation,type RankedCheck} from "@stacksense/contracts";
import {hypothesesForVictims} from "../hypotheses";
import {checkCatalog} from "../tables/checks";
import type {Family} from "../priors/archetypes";
export function simulateBuilding(seed:number,opts:{hiddenFamily?:Family;outcomePerturbation?:number}={}) {
 if(!Number.isSafeInteger(seed))throw new Error("Seed must be a safe integer");
 const noise=opts.outcomePerturbation??0;if(noise<0||noise>1||!Number.isFinite(noise))throw new Error("Invalid perturbation");
 let value=seed>>>0;
 const random=()=>{let t=value+=0x6d2b79f5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 const floors=4+Math.floor(random()*7),positions=1+Math.floor(random()*3);
 const family=opts.hiddenFamily?SourceFamily.parse(opts.hiddenFamily):SourceFamily.options[Math.floor(random()*SourceFamily.options.length)]!;
 const victimFloor=family==="roof_terrace"?floors:1+Math.floor(random()*(floors-1)),position=String(1+Math.floor(random()*positions)).padStart(2,"0"),victimId=`${victimFloor}${position}`;
 const building=Building.parse({id:`sim-${seed}`,name:`Simulated building ${seed}`,region:"IN",archetype:"GENERIC",lat:19.07,lon:72.88,floors,hasTerrace:true,
  flats:Array.from({length:floors},(_,f)=>Array.from({length:positions},(_,p)=>({id:`${f+1}${String(p+1).padStart(2,"0")}`,floor:f+1,position:String(p+1).padStart(2,"0"),wetAreas:["bathroom","kitchen","wc"],externalWalls:[p%2?"E":"W"],hasWaterMeter:random()<.7,access:random()<.12?"locked":"open"}))).flat(),
  stacks:Array.from({length:positions},(_,p)=>({id:`stack-${p+1}`,kind:"duct",flatIds:Array.from({length:floors},(_,f)=>`${f+1}${String(p+1).padStart(2,"0")}`)})),
 });
 // The victim can report evidence; neighbour access remains independently randomized.
 building.flats.find(f=>f.id===victimId)!.access="open";
 const truth=hypothesesForVictims(building,[victimId])[0]!.hypotheses.find(h=>h.family===family&&h.parentId===null)!;
 let counter=0;
 const observation=(patch:Partial<Observation>):Observation=>({id:`sim-${seed}-${counter}`,eventKey:`sim-${seed}-${counter}`,flatId:victimId,at:new Date(Date.UTC(2026,9,30,16,counter)).toISOString(),kind:"check_result",zone:"other",surface:"unclear",room:null,hazards:[],hazardQuestionsAnswered:true,checkId:null,meter:null,moisture:null,finding:null,photoIds:[],sourceMessageIds:[],provenance:"simulated",rawText:"simulated check result",...patch});
 const initialObservation=observation({kind:"complaint",room:"bathroom",zone:family==="facade_window"?"window_perimeter":family==="condensation"||family==="other"?"other":"ceiling",surface:family==="facade_window"?"efflorescence":family==="condensation"?"mould":"damp_stain",rawText:family==="condensation"?"mould in cold corner":family==="roof_terrace"?"top floor ceiling stain":"simulated building stain"});
 return {building,truth,victimFlatId:victimId,initialObservation,answer(check:RankedCheck):Observation {
  const target=building.flats.find(f=>f.id===check.targetFlatId);if(!target)throw new Error("Unknown check target");
  const definition=checkCatalog[check.type];if(definition.requiresMeter&&!target.hasWaterMeter)throw new Error("No meter");if(target.access==="locked")throw new Error("Flat locked");
  const outcomes=Object.entries(definition.outcomes);let draw=random(),outcome=outcomes.at(-1)![0];
  for(const [name,row] of outcomes){draw-=(1-noise)*row[family]+noise/outcomes.length;if(draw<=0){outcome=name;break;}}
  counter++;const base={checkId:check.id,flatId:target.id};
  if(check.type==="duct_photo")return observation({...base,zone:"duct_wall",surface:outcome==="dry"?"dry":"damp_stain",rawText:`duct wall ${outcome}`});
  if(check.type==="meter_check")return observation({...base,kind:"meter_reading",zone:"meter",meter:{start:100,end:outcome==="moved"?101:100,minutes:10},rawText:`meter ${outcome}`});
  if(check.type==="trap_grout_photo")return observation({...base,zone:"trap_grout",surface:outcome==="cracked"?"crack":"dry",rawText:`trap grout ${outcome}`});
  if(check.type==="dye_test"||check.type==="flood_test")return observation({...base,rawText:outcome==="positive"?(check.type==="dye_test"?"dye appeared":"flood test positive"):"test negative"});
  if(check.type==="inspect")return observation({...base,flatId:["upper_wet_area","upper_supply"].includes(outcome)?`${victimFloor+1}${position}`:victimId,kind:"professional_finding",finding:{family:SourceFamily.parse(outcome),component:null},rawText:"simulated professional finding"});
  if(check.type==="moisture_reading")return observation({...base,kind:"moisture_reading",moisture:{value:outcome==="positive"?12:24,unit:"%WME"},rawText:"simulated moisture reading"});
  return observation({...base,zone:check.type==="ceiling_photo"?"ceiling":"window_perimeter",surface:outcome==="positive"?"damp_stain":"dry",rawText:"simulated observation"});
 }};
}
