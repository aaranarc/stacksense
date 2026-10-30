import { expect, it } from 'vitest';
import { visualStatus,statusOf } from './visual';
import { demo } from './adapters';
it('pairs a passed check with its date and documented border', () => { expect(visualStatus('Check passed · 31 Oct','green')).toEqual({colour:'#16A34A',label:'Check passed · 31 Oct',dashed:false}); });
it('keeps hypothetical evidence visibly dashed', () => { expect(visualStatus('Suspected / inspect','amber',true)).toEqual({colour:'#D97706',label:'Suspected / inspect',dashed:true}); });
it('keeps unassessed separate from leading source', () => { expect(visualStatus('Not assessed').colour).toBe('#9CA3AF'); expect(visualStatus('Leading source','red').colour).toBe('#DC2626'); });
it('shows a new inspection request even when the previous duct check passed',()=>{const state=demo.states[11]!;expect(statusOf(state.building.flats.find(f=>f.id==='302')!,state)).toEqual({colour:'#D97706',label:'302 · inspect',dashed:true});});
