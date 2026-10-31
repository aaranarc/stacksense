import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it} from 'vitest';
import {InspectionTask} from './InspectionTask';
beforeEach(()=>sessionStorage.clear());
afterEach(cleanup);
it('retains assignment, due date and completion across page remounts without changing case evidence',()=>{
 const props={caseId:'audit-case',id:'forecast-402',title:'Re-check flat 402'};
 render(<InspectionTask {...props}/>);
 fireEvent.change(screen.getByRole('textbox',{name:'Owner for Re-check flat 402'}),{target:{value:'Building team'}});
 fireEvent.change(screen.getByLabelText('Due date for Re-check flat 402'),{target:{value:'2026-11-10'}});
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete Re-check flat 402'}));
 cleanup();render(<InspectionTask {...props}/>);
 expect((screen.getByRole('textbox',{name:'Owner for Re-check flat 402'}) as HTMLInputElement).value).toBe('Building team');
 expect((screen.getByLabelText('Due date for Re-check flat 402') as HTMLInputElement).value).toBe('2026-11-10');
 expect((screen.getByRole('checkbox',{name:'Complete Re-check flat 402'}) as HTMLInputElement).checked).toBe(true);
 expect((screen.getByRole('button',{name:'Add calendar reminder'}) as HTMLButtonElement).disabled).toBe(false);
 expect(sessionStorage.getItem('stacksense:workspace')).toBeNull();
});
