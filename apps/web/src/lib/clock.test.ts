import {afterEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{process.env.NEXT_PUBLIC_USE_MOCK_ENGINE='false';});
import {engine,buildings} from './adapters';
afterEach(()=>vi.useRealTimers());
it('uses the current app clock for new live cases while preserving scripted scenario dates',()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-31T09:30:00Z'));const current=engine.createCase(buildings.IN);expect(current.now).toBe('2026-10-31T09:30:00.000Z');expect(engine.createCase(buildings.IN,{now:'2026-10-30T16:30:00Z'}).now).toBe('2026-10-30T16:30:00Z');expect(engine.createCase(buildings.IN).caseId).not.toBe(current.caseId);});
