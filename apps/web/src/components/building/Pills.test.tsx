import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {runScenario,scenarios} from '@stacksense/engine';
vi.mock('../../lib/adapters',async load=>({...(await load<typeof import('../../lib/adapters')>()),getRain:vi.fn().mockResolvedValue(null)}));
import {Pills} from './Pills';
afterEach(cleanup);
it('opens the rain pane on the façade case by default',()=>{render(<Pills state={runScenario(scenarios.happy)} selectedFlat={null}/>);fireEvent.click(screen.getByRole('button',{name:'Rain'}));expect(screen.getByText(/Flat 202/)).toBeTruthy();});
