import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {demo} from '../../lib/adapters';
import {DryPaintTab} from './DryPaintTab';
import {recoveryInput} from '../../lib/recoveryInput';
afterEach(cleanup);
it('keeps a better photo separate from dry and paint readiness',()=>{render(<DryPaintTab state={demo.states[10]!} onState={()=>{}}/>);expect(screen.getByText('Ready to paint · not ready')).toBeTruthy();expect(screen.getByText('Dry · unknown')).toBeTruthy();expect(screen.getByText(/Only a moisture reading/)).toBeTruthy();});
it('records the entered reading without deciding a threshold in the UI',()=>{const observation=recoveryInput(demo.states[10]!,'moisture_reading',12);expect(observation.moisture).toEqual({value:12,unit:'%WME'});expect(observation.flatId).toBe('402');expect(()=>recoveryInput(demo.states[10]!,'moisture_reading',NaN)).toThrow();});
