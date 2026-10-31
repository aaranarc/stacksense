import {z} from 'zod';
import type {EngineState} from '@stacksense/contracts';
import {applyObservations,createCase} from './bayes';
import type {MemoryState} from './predict';
import type {WeatherState} from './rain';
const Answers=z.object({water_near_electrics:z.boolean(),sagging_ceiling:z.boolean(),fast_ingress:z.boolean(),sewage:z.boolean()}).strict();
/** Any positive answer stops immediately; clearing incomplete requires all four explicit answers. */
export function answerSafetyQuestions(state:EngineState,input:Partial<z.infer<typeof Answers>>):EngineState{
 const partial=Answers.partial().parse(input);
 const hasHazard=Object.values(partial).some(Boolean);
 const answers=hasHazard?partial:Answers.parse(input);
 const complete=Answers.safeParse(answers).success;
 if(!state.observations.length)throw new Error('Import a report before answering its safety questions.');
 const hazards=(Object.keys(answers) as (keyof typeof answers)[]).filter(h=>answers[h]);
 const observations=state.observations.map(o=>({...o,hazardQuestionsAnswered:o.hazardQuestionsAnswered||complete,hazards:[...new Set([...o.hazards,...hazards])]}));
 const memory=(state as MemoryState).memoryPrior,weather=(state as WeatherState).weather;
 return applyObservations(createCase(state.building,{now:state.now,caseId:state.caseId,memory}),observations,{photoLabels:state.photoLabels,rain:weather?.rain,forecast:weather?.forecast});
}
