import { expect,it } from 'vitest';
import { mockEngine, heroStates } from './mockEngine';
import { Observation } from '@stacksense/contracts';
it('advances independently through all eleven story steps',()=>{let s=mockEngine.createCase(heroStates[0]!.building);for(let i=1;i<=11;i++){s=mockEngine.applyObservations(s,[]);expect(s.caseId).toBe(`hero-${String(i).padStart(2,'0')}`);}expect(s.recovery.paint).toBe('not_ready');expect(s.prediction.memory.upper_wet_area).toBe(1);});
it('uses the predefined plumber variant for what-if',()=>{expect(mockEngine.whatIf(heroStates[9]!,[]).jobSheet?.send[0]?.trade).toBe('plumber');});
it('never offers a meter check for a flat without a meter',()=>{for(const state of heroStates) for(const check of state.nextChecks.filter(c=>c.type==='meter_check'&&!c.excluded)) expect(state.building.flats.find(f=>f.id===check.targetFlatId)?.hasWaterMeter).toBe(true);});
it('exposes a schema-valid fixture simulator with the shared signature',()=>{const simulation=mockEngine.simulateBuilding(1);const answer=simulation.answer(heroStates[1]!.nextChecks[0]!);expect(Observation.safeParse(answer).success).toBe(true);expect(answer.provenance).toBe('simulated');});
