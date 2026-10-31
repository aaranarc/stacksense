import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { NextCheck } from './NextCheck';
import {CheckLinkProvider} from '../phone/PhoneSimulator';
import { demo,residentApi } from '../../lib/adapters';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('shows ranking exclusions and closes the drawer with Escape',()=>{render(<NextCheck state={demo.states[1]!} onDemoStep={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'why? ▸'}));expect(screen.getByText('no meter')).toBeTruthy();fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();});
it('shows engine stop reason and removes the send action',()=>{render(<NextCheck state={demo.states[9]!} onDemoStep={()=>{}}/>);expect(screen.getByText(demo.states[9]!.stop.reason!)).toBeTruthy();expect(screen.queryByRole('button',{name:'Send link to neighbour'})).toBeNull();});
it('offers an explicitly labelled /c/demo preview during a safe neighbour check',()=>{vi.spyOn(residentApi,'isDemo').mockReturnValue(true);render(<CheckLinkProvider state={demo.states[1]!} onRead={()=>{}}><NextCheck state={demo.states[1]!} onDemoStep={()=>{}}/></CheckLinkProvider>);fireEvent.click(screen.getByRole('button',{name:'Preview demo phone'}));expect(screen.getByTitle('Neighbour check').getAttribute('src')).toBe('/c/demo');expect(screen.getByText(/No evidence is added to your current case/)).toBeTruthy();});
it('explains an incomplete safety gate instead of waiting for evidence',()=>{vi.spyOn(residentApi,'isDemo').mockReturnValue(true);const onOpenJudge=vi.fn();const state={...demo.states[1]!,safety:{status:'incomplete' as const,reasons:['Hazard questions unanswered'],actions:[]},nextChecks:[],stop:{stopped:false,reason:null}};render(<CheckLinkProvider state={state} onRead={()=>{}}><NextCheck state={state} onDemoStep={()=>{}} onOpenJudge={onOpenJudge}/></CheckLinkProvider>);expect(screen.getByText(/Safety questions unanswered — send the neighbour link, or open Judge Mode → Play/)).toBeTruthy();expect(screen.queryByText('Waiting for case evidence.')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Open Judge Mode'}));expect(onOpenJudge).toHaveBeenCalledOnce();fireEvent.click(screen.getByRole('button',{name:'Send link to neighbour'}));expect(screen.getByTitle('Neighbour check')).toBeTruthy();});
it('words the 80% stop exactly like the Second Opinion badge (Fallback · no objection)',async()=>{
 const {SecondOpinionBanner}=await import('../opinion/SecondOpinionBanner');
 const state=structuredClone(demo.states[9]!);state.stop={stopped:true,reason:'Probable source reached 80% with no Second Opinion objection'};
 render(<><NextCheck state={state} onDemoStep={()=>{}}/><SecondOpinionBanner state={state} onState={()=>{}}/></>);
 expect(screen.getByText('Probable source reached 80% · Second Opinion: Fallback · no objection')).toBeTruthy();
 expect(screen.getByText('Fallback · no objection')).toBeTruthy();
});
