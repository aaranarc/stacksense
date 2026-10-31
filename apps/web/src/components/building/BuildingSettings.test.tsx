import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('next/navigation',()=>import('../../test/nextNavigation'));
vi.mock('next/link',()=>import('../../test/nextLink'));
import {TestApp} from '../../test/TestApp';
import {navigate} from '../../test/nextNavigation';
beforeEach(()=>{sessionStorage.clear();navigate('/settings');});
afterEach(cleanup);
it('creates a user building and starts with no simulated evidence',async()=>{
 render(<TestApp/>);fireEvent.click(screen.getByText('Set up your own building'));
 fireEvent.change(screen.getByLabelText('Building name'),{target:{value:'Example building'}});
 fireEvent.change(screen.getByLabelText('Floors'),{target:{value:'3'}});
 fireEvent.change(screen.getByLabelText('Flats per floor'),{target:{value:'2'}});
 fireEvent.click(screen.getByRole('button',{name:'Create building and start case'}));
 expect(screen.getAllByText('Example building').length).toBeGreaterThan(0);
 const saved=JSON.parse(sessionStorage.getItem('stacksense:workspace')!);
 expect(saved.state.building.flats).toHaveLength(6);expect(saved.state.building.flats.every((flat:{hasWaterMeter:boolean})=>!flat.hasWaterMeter)).toBe(true);
 expect(saved.state.observations).toEqual([]);expect(saved.fixture).toBe(false);expect(saved.read).toBeNull();
});
