import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { NextCheck } from './NextCheck';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('shows ranking exclusions and closes the drawer with Escape',()=>{render(<NextCheck state={demo.states[1]!} onDemoStep={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'why? ▸'}));expect(screen.getByText('no meter')).toBeTruthy();fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();});
it('shows engine stop reason and removes the send action',()=>{render(<NextCheck state={demo.states[9]!} onDemoStep={()=>{}}/>);expect(screen.getByText(demo.states[9]!.stop.reason!)).toBeTruthy();expect(screen.queryByRole('button',{name:'Send link'})).toBeNull();});
