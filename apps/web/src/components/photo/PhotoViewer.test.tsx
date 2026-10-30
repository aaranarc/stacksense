import { useState } from 'react';
import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
vi.mock('../../lib/adapters',async importOriginal=>{const original=await importOriginal<typeof import('../../lib/adapters')>();const {mockEngine}=await import('../../mocks/mockEngine');return {...original,engine:mockEngine};});
import { demo } from '../../lib/adapters';
import { correctPhoto } from '../../lib/correctPhoto';
import { SourceBars } from '../odds/SourceBars';
import { PhotoViewer } from './PhotoViewer';
afterEach(cleanup);
function Harness(){const [state,setState]=useState(structuredClone(demo.states[8]!));return <><SourceBars state={state}/><PhotoViewer photoId="P502" label={state.photoLabels.find(p=>p.photoId==='P502')} onClose={()=>{}} onCorrect={(label,changed)=>setState(correctPhoto(state,label,changed))}/></>;}
it('reruns the adapter and changes the bars after a human correction',()=>{render(<Harness/>);expect(screen.getByRole('meter',{name:'502 trap grout (probable)'}).getAttribute('aria-valuenow')).toBe('87');fireEvent.click(screen.getByRole('button',{name:'wrong?'}));fireEvent.change(screen.getByLabelText('Correct surface'),{target:{value:'dry'}});fireEvent.click(screen.getByRole('button',{name:'Apply correction'}));expect(screen.getByRole('meter',{name:'502 bathroom area'}).getAttribute('aria-valuenow')).toBe('55');expect(screen.getByText(/Human-corrected/)).toBeTruthy();});
it('confirming an unchanged label keeps the probabilities',()=>{const before=demo.states[8]!;const after=correctPhoto(before,{...before.photoLabels[0]!,humanCorrected:true},false);expect(after.posterior).toEqual(before.posterior);expect(after.photoLabels[0]!.humanCorrected).toBe(true);});
