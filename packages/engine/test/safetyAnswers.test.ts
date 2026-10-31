import {expect,it} from 'vitest';
import {answerSafetyQuestions} from '../src/safetyAnswers';
import {createCase,applyObservations,blockA} from '../src';
import {observation} from './helpers';
const no={water_near_electrics:false,sagging_ceiling:false,fast_ingress:false,sewage:false};
it('requires all four explicit answers and keeps a known positive hazard stopped',()=>{
 const state=applyObservations(createCase(blockA),[observation({hazardQuestionsAnswered:false,rawText:'ceiling stain, no ceiling sagging and no sewage smell'})]);
 expect(()=>answerSafetyQuestions(state,{sewage:false})).toThrow();
 expect(answerSafetyQuestions(state,no).safety.status).toBe('ok');
 const positive=answerSafetyQuestions(state,{sewage:true});expect(positive.safety.status).toBe('emergency');expect(positive.observations[0]!.hazardQuestionsAnswered).toBe(false);
 expect(answerSafetyQuestions(state,{...no,sewage:true}).safety.status).toBe('emergency');
 const hazard=applyObservations(state,[observation({id:'hazard',rawText:'sparks at socket'})]);
 expect(answerSafetyQuestions(hazard,no).safety.status).toBe('emergency');
});
