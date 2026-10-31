import { render,screen,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { SourceBars } from './SourceBars';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('caps component labels and includes all residual probability',()=>{const state=structuredClone(demo.states[8]!);state.secondOpinion!.allowedLevel='area';render(<SourceBars state={state}/>);expect(screen.getByRole('meter',{name:'502 bathroom area'})).toBeTruthy();expect(screen.queryByText('502 trap grout (probable)')).toBeNull();expect(screen.getAllByRole('meter').reduce((sum,node)=>sum+Number(node.getAttribute('aria-valuenow')),0)).toBe(100);});
