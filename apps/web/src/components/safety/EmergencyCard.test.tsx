import { render,screen,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { EmergencyCard,humanReason } from './EmergencyCard';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('turns engine hazard reasons into human text without internal ids',()=>{
 expect(humanReason('sim-2003-0: water_near_electrics')).toBe('Water near electrics');
 expect(humanReason('sim-2003-0: hazard keyword switch')).toBe('Message mentions “switch”');
 expect(humanReason('Water near electrics')).toBe('Water near electrics');
 const state={...demo.emergency,safety:{status:'emergency' as const,reasons:['sim-2003-0: water_near_electrics','sim-2003-1: water_near_electrics'],actions:[]}};
 render(<EmergencyCard state={state}/>);
 expect(screen.getAllByText('Water near electrics')).toHaveLength(1);
 expect(screen.queryByText(/sim-2003/)).toBeNull();
});
