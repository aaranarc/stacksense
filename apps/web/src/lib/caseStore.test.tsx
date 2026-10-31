import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const route=vi.hoisted(()=>({caseId:''}));
vi.mock('next/navigation',()=>({useParams:()=>route}));
import PrintPage from '../app/print/[caseId]/page';
import {saveCase,loadCaseFromRoute} from './caseStore';
import {demo} from './adapters';
beforeEach(()=>sessionStorage.clear());
afterEach(()=>{cleanup();vi.restoreAllMocks();sessionStorage.clear();});
it('populates the print route for the actual encoded colon URL and enables Print / Save PDF',async()=>{
 const state=structuredClone(demo.states[9]!);state.caseId='block-a-owner:402';state.jobSheet!.caseId=state.caseId;saveCase(state);
 route.caseId=encodeURIComponent(state.caseId);expect(`/print/${route.caseId}`).toBe('/print/block-a-owner%3A402');
 const print=vi.spyOn(window,'print').mockImplementation(()=>{});render(<PrintPage/>);
 expect(await screen.findByRole('heading',{name:'Job Sheet'})).toBeTruthy();
 const button=screen.getByRole('button',{name:'Print / Save PDF'}) as HTMLButtonElement;expect(button.disabled).toBe(false);
 expect(screen.queryByText(/This Job Sheet is unavailable/)).toBeNull();fireEvent.click(button);expect(print).toHaveBeenCalledOnce();
});
it('handles malformed encoding without crashing or guessing a storage key',()=>{expect(loadCaseFromRoute('%E0%A4%A')).toBeNull();});
it('decodes once rather than resolving a double encoded case ID',()=>{const state=structuredClone(demo.states[9]!);state.caseId='case:402';saveCase(state);expect(loadCaseFromRoute(encodeURIComponent(encodeURIComponent(state.caseId)))).toBeNull();});
