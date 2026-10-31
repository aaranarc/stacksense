import { render,screen,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { SourceBars } from './SourceBars';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('caps component labels and includes all residual probability',()=>{const state=structuredClone(demo.states[8]!);state.secondOpinion!.allowedLevel='area';render(<SourceBars state={state}/>);expect(screen.getByRole('meter',{name:'502 bathroom area'})).toBeTruthy();expect(screen.queryByText('502 trap grout (probable)')).toBeNull();expect(screen.getAllByRole('meter').reduce((sum,node)=>sum+Number(node.getAttribute('aria-valuenow')),0)).toBe(100);});
it('highlights only the leading bar red and uses neutral fills for every alternative, never green',()=>{render(<SourceBars state={demo.states[5]!}/>);const fills=screen.getAllByRole('meter').map(node=>(node.firstElementChild as HTMLElement).style.background);expect(fills.filter(fill=>fill==='rgb(229, 72, 77)')).toHaveLength(1);expect(fills.filter(fill=>fill!=='rgb(229, 72, 77)').every(fill=>fill==='rgb(152, 162, 179)')).toBe(true);expect(fills).not.toContain('rgb(22, 163, 74)');expect(screen.getByText(/· Probable source/)).toBeTruthy();});
