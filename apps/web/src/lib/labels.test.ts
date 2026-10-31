import {expect,it} from 'vitest';
import {regionalText,trailTime} from './labels';
it('uses UK flat labels in sentences without touching units',()=>{
 expect(regionalText('Arrange open access to flat 6','UK')).toBe('Arrange open access to Flat 6');
 expect(regionalText('breaking 4 ceiling','UK')).toBe('breaking Flat 4 ceiling');
 expect(regionalText('Professional supervised 24 h flood test of 6 bathroom','UK')).toBe('Professional supervised 24 h flood test of Flat 6 bathroom');
 expect(regionalText('6 floor gully grout','UK')).toBe('Flat 6 floor gully grout');
 expect(regionalText('Flat 6 bathroom · 2 floors · 1-minute photo','UK')).toBe('Flat 6 bathroom · 2 floors · 1-minute photo');
 expect(regionalText('breaking 402 ceiling','IN')).toBe('breaking 402 ceiling');
 expect(regionalText('2 · duct dry · 31 Oct · inspection requested','UK')).toBe('2 · duct dry · 31 Oct · inspection requested');
 expect(regionalText('re-check after rain · Tue 3 Nov','UK')).toBe('re-check after rain · Tue 3 Nov');
});
it('formats trail timestamps for people',()=>{expect(trailTime('2026-10-31T14:05:00.000Z')).toBe('31 Oct 2026, 14:05');expect(trailTime('unknown')).toBe('unknown');});
