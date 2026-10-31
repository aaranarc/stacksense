import {expect,it} from 'vitest';
import {sourceEstimates,permittedSourceLabel} from '../src/sourceEstimates';
import {heroSnapshots} from '../src/scenarios/hero';
it('groups component mass at the permitted level without duplicate alternative labels',()=>{
 const state=heroSnapshots()[8]!;
 state.secondOpinion={...state.secondOpinion!,allowedLevel:'area'};
 const rows=sourceEstimates(state);
 expect(permittedSourceLabel(state.hypotheses.find(h=>h.parentId)!,state)).toBe('502 bathroom area');
 expect(new Set(rows.map(r=>r.label)).size).toBe(rows.length);
 expect(rows.reduce((sum,row)=>sum+row.probability,0)).toBeCloseTo(1,10);
 const area=rows.find(r=>r.label==='502 bathroom area')!;
 expect(area.probability).toBeGreaterThan(state.posterior[area.id]??0);
});
