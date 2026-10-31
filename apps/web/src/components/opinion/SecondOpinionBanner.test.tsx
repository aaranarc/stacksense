import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {demo} from '../../lib/adapters';
import {SecondOpinionBanner} from './SecondOpinionBanner';
afterEach(cleanup);
it('opens the evidence review without raising the allowed claim',()=>{render(<SecondOpinionBanner state={demo.states[7]!} onState={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:/Second Opinion:/}));expect(screen.getByRole('dialog')).toBeTruthy();for(const text of ['Supports','Challenges','Still unknown','What would change this'])expect(screen.getByRole('heading',{name:text})).toBeTruthy();expect(screen.getByText('Trap condition')).toBeTruthy();});
it('labels a failed review as unreviewed',()=>{const state=structuredClone(demo.states[7]!);state.secondOpinion!.verdict='review_failed';render(<SecondOpinionBanner state={state} onState={()=>{}}/>);expect(screen.getByText('Second Opinion unavailable — treat this result as unreviewed.')).toBeTruthy();});
