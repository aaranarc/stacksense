import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {NextLeakTab} from './NextLeakTab';
import {demo} from '../../lib/adapters';
afterEach(cleanup);
it('renders the inspection forecast and confirmed memory from the state',()=>{render(<NextLeakTab state={demo.states[11]!}/>);expect(screen.getByText('302 · Inspect')).toBeTruthy();expect(screen.getByText('602 · Inspect')).toBeTruthy();expect(screen.getByText(/Re-check 202 after/)).toBeTruthy();expect(screen.getByRole('heading',{name:'Memory · confirmed cases'})).toBeTruthy();});
it('does not create a link for an unranked inspection',()=>{render(<NextLeakTab state={demo.states[11]!}/>);expect((screen.getByRole('button',{name:'Send inspection link to flat 602'}) as HTMLButtonElement).disabled).toBe(true);});
