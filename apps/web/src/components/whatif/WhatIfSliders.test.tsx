import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
vi.mock('../../lib/adapters',async load=>{const original=await load<typeof import('../../lib/adapters')>();const {mockEngine}=await import('../../mocks/mockEngine');return {...original,engine:mockEngine};});
import {demo} from '../../lib/adapters';
import {WhatIfSliders} from './WhatIfSliders';
afterEach(cleanup);
it('changes a recorded meter through the engine adapter',()=>{const onState=vi.fn();render(<WhatIfSliders state={demo.states[9]!} onState={onState}/>);fireEvent.click(screen.getByRole('switch',{name:'502 meter: still ↔ moved'}));expect(onState.mock.calls[0]![0].jobSheet.send[0].trade).toBe('plumber');});
it('disables controls before evidence exists',()=>{render(<WhatIfSliders state={demo.states[0]!} onState={()=>{}}/>);expect(screen.getAllByRole('switch').every(input=>(input as HTMLInputElement).disabled)).toBe(true);});
