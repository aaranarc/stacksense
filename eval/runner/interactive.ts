import frozen from '../data/frozen-cases';
import {Building,Observation,PhotoLabel,RainSeries,SourceFamily,Trade,EvalResults,type EngineState} from '../../packages/contracts/src/index';
import {z} from 'zod';
import {engineRun,voiChoice,simCases,type EvalCase} from './caseRun';
import {aggregate} from './metrics';
import {createCase,applyObservations,applySecondOpinion,sourceEstimates} from '../../packages/engine/src/index';
const Frozen=z.object({id:z.string(),building:Building,steps:Observation.array().array(),truth:z.object({family:SourceFamily,flatId:z.string().nullable(),trade:Trade,emergency:z.boolean()}),rain:RainSeries.optional(),photoLabels:PhotoLabel.array().optional()});
/** Rerun the same StackSense loop as the CLI on the frozen hard cases and seeds 1–60. */
export function interactiveEvaluation(){
 const hard:EvalCase[]=Frozen.array().parse(frozen).map(c=>{
  const pool=c.steps.filter(s=>s.every(o=>o.checkId)),used=new Set<number>();
  return {id:c.id,set:'hard',building:c.building,truth:{...c.truth,inspect:c.truth.trade==='general_inspector'},victimFlatId:c.steps[0]?.find(o=>o.kind==='complaint')?.flatId??null,timeline:c.steps.filter(s=>!s.some(o=>o.checkId)),rain:c.rain,photoLabels:c.photoLabels,answer(check){const i=pool.findIndex((s,j)=>!used.has(j)&&s.every(o=>o.checkId===check.id));if(i<0)return null;used.add(i);return pool[i]!;}};
 });
 const outcomes=[...hard,...simCases(60).map(make=>make())].map(c=>engineRun(c,voiChoice,true,{unscripted:[],asked:[]}));
 const result={generatedAt:new Date().toISOString(),label:'team-built test, not field accuracy' as const,sets:{hardCases:hard.length,simBuildings:60,photos:0,messages:0},rows:[aggregate('StackSense',outcomes)],rowsBySet:{hard:[aggregate('StackSense',outcomes.filter(o=>o.set==='hard'))],sim:[aggregate('StackSense',outcomes.filter(o=>o.set==='sim'))]},robustness:[],ai:null,pending:[{method:'Baselines and AI reading',reason:'Not rerun here. Compare the prepared snapshot for baselines, robustness and measured AI results.'}]};
 EvalResults.parse(result);return result;
}
export function evaluateCurrentCase(state:EngineState){
 let replay=applyObservations(createCase(state.building,{now:state.now,caseId:state.caseId}),state.observations,{photoLabels:state.photoLabels});
 replay=applySecondOpinion(replay,null);
 return {caseId:state.caseId,safety:replay.safety.status,observations:replay.observations.length,probableSource:sourceEstimates(replay)[0]?.label??'Unresolved',trade:replay.jobSheet?.send.map(t=>t.trade).join(', ')||'Not decided',nextCheck:replay.nextChecks.find(c=>!c.excluded)?.id??'None available',review:'Unreviewed — deterministic replay only',accuracy:'Not scored: this case has no independently labelled ground truth.'};
}
