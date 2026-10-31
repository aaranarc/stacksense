import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { NextCheck } from './NextCheck';
import {CheckLinkProvider} from '../phone/PhoneSimulator';
import { demo,residentApi } from '../../lib/adapters';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('shows ranking exclusions and closes the drawer with Escape',()=>{render(<NextCheck state={demo.states[1]!} onDemoStep={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'why? ▸'}));expect(screen.getByText('no meter')).toBeTruthy();fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();});
it('shows engine stop reason and removes the send action',()=>{render(<NextCheck state={demo.states[9]!} onDemoStep={()=>{}}/>);expect(screen.getByText(demo.states[9]!.stop.reason!)).toBeTruthy();expect(screen.queryByRole('button',{name:'Send link'})).toBeNull();});
it('offers an explicitly labelled /c/demo preview during a safe neighbour check',()=>{vi.spyOn(residentApi,'isDemo').mockReturnValue(true);render(<CheckLinkProvider state={demo.states[1]!} onRead={()=>{}}><NextCheck state={demo.states[1]!} onDemoStep={()=>{}}/></CheckLinkProvider>);fireEvent.click(screen.getByRole('button',{name:'Preview demo phone'}));expect(screen.getByTitle('Neighbour check').getAttribute('src')).toBe('/c/demo');expect(screen.getByText(/No evidence is added to your current case/)).toBeTruthy();});
