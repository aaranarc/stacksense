import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import type {EngineState} from '@stacksense/contracts';
import {runScenario,scenarios} from '@stacksense/engine';
import {WhatIfSliders} from './WhatIfSliders';
afterEach(cleanup);
it('restores the previous Second Opinion when the evidence is toggled back',()=>{
 const hero=runScenario(scenarios.happy);const original=hero.secondOpinion!;expect(original.verdict).not.toBe('review_failed');
 let state:EngineState=hero;const onState=vi.fn((next:EngineState)=>{state=next;});
 const {rerender}=render(<WhatIfSliders state={state} onState={onState}/>);
 fireEvent.click(screen.getByRole('switch',{name:'502 meter: still ↔ moved'}));
 expect(state.secondOpinion?.verdict).toBe('review_failed');expect(state.stop.reason).not.toMatch(/no Second Opinion objection/);
 rerender(<WhatIfSliders state={state} onState={onState}/>);
 fireEvent.click(screen.getByRole('switch',{name:'502 meter: still ↔ moved'}));
 expect(state.secondOpinion?.verdict).toBe(original.verdict);expect(state.jobSheet?.send[0]?.trade).toBe(hero.jobSheet?.send[0]?.trade);
});
