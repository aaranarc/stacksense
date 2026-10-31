import {expect,it} from 'vitest';
import {ukDemo} from './regionDemo';
import {regionalText} from './labels';
it('uses actual UK flat IDs with simulated evidence and no meter reading',()=>{const state=ukDemo();expect(state.building.region).toBe('UK');expect(state.observations.every(o=>state.building.flats.some(f=>f.id===o.flatId))).toBe(true);expect(state.observations.some(o=>o.kind==='meter_reading')).toBe(false);expect(state.jobSheet?.region).toBe('UK');});
it('uses UK terminology without changing source attribution',()=>{expect(regionalText('society secretary: nahani trap','UK')).toBe('building/landlord managing agent: floor gully/shower trap');});
