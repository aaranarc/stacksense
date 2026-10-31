import {expect,it} from 'vitest';
import {dailyRain} from './weatherView';
it('groups weather by day and selects the wall without producing odds',()=>{const series={lat:0,lon:0,source:'fixture' as const,hourly:[{t:'2026-10-30T01:00:00Z',precipMm:2,windDirDeg:270,windSpeedMs:3},{t:'2026-10-30T02:00:00Z',precipMm:1,windDirDeg:90,windSpeedMs:2}]};expect(dailyRain(series,'W')[0]!.value).toBe(6);expect(dailyRain(series,'E')[0]!.value).toBe(2);});
