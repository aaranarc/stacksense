import {expect,it} from 'vitest';
import {textHazards,safetyOf} from '../src/safety';
import {observation} from './helpers';
it.each([
 'no ceiling sagging and no sewage smell',
 'No water near electrics; ceiling is not sagging; no flooding; no sewage smell.',
 'No sparks, no socket water, no bulging ceiling, no gushing water.',
 'ceiling sagging nahi; sewage smell nahi',
 "ceiling isn't sagging and there is no sewage smell",
 'no ceiling sagging or sewage smell',
 'no sagging or bulging ceiling',
])('does not turn explicit negative statements into hazards: %s',rawText=>{
 expect(textHazards(rawText).hazards).toEqual([]);
 expect(safetyOf([observation({rawText,hazardQuestionsAnswered:false})]).status).toBe('incomplete');
});
it.each([
 ['No sewage smell but ceiling is bulging',['sagging_ceiling']],
 ['No ceiling sagging. Water near socket is sparking',['water_near_electrics']],
 ['Not sure whether the ceiling is sagging',['sagging_ceiling']],
 ['Cannot rule out sewage',['sewage']],
 ['No sewage smell?',['sewage']],
 ['No water near socket but socket is sparking',['water_near_electrics']],
 ['no stain near socket; sewage is overflowing',['water_near_electrics','sewage']],
])('preserves positive or uncertain hazards: %s',(rawText,hazards)=>{
 expect(textHazards(rawText as string).hazards).toEqual(hazards);
});
it('never removes explicit hazard labels or treats negative statements as completed safety answers',()=>{
 expect(safetyOf([observation({rawText:'no sewage smell',hazards:['sewage']})]).status).toBe('emergency');
 expect(textHazards('currently damp').hazards).toEqual([]);
});
