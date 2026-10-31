import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {demo} from '../../lib/adapters';
import {JobSheetTab,JOB_FOOTER} from './JobSheetTab';
afterEach(cleanup);
it('shows send and do-not-send with an encoded WhatsApp summary',()=>{render(<JobSheetTab state={demo.states[9]!}/>);expect(screen.getByRole('heading',{name:"Don't send"})).toBeTruthy();expect(screen.getByText(JOB_FOOTER)).toBeTruthy();expect(screen.getByRole('link',{name:'Share on WhatsApp'}).getAttribute('href')).toContain('wa.me/?text=');});
it('never displays a trade or print action in an emergency',()=>{const state={...demo.states[9]!,safety:demo.emergency.safety};render(<JobSheetTab state={state}/>);expect(screen.queryByText(/waterproofer/)).toBeNull();expect(screen.queryByRole('button',{name:'Download PDF'})).toBeNull();});
