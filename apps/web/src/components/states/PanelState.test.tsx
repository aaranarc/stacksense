import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {PanelState} from './PanelState';
import {DataBadge} from './DataBadge';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('labels every AI mode and keeps demo provenance visible',()=>{const {rerender}=render(<DataBadge mode="live"/>);expect(screen.getByText('Live')).toBeTruthy();rerender(<DataBadge mode="cached" demoData/>);expect(screen.getByText('Cached · Demo data')).toBeTruthy();rerender(<DataBadge mode="fallback"/>);expect(screen.getByText('Fallback')).toBeTruthy();rerender(<DataBadge/>);expect(screen.getByText('Not read yet')).toBeTruthy();});
it('contains a panel failure without exposing raw errors and lets the user retry',()=>{vi.spyOn(console,'error').mockImplementation(()=>{});let failed=true;function Content(){if(failed)throw new Error('private internal error');return <p>Recovered panel</p>;}render(<PanelState name="Evidence"><Content/></PanelState>);expect(screen.getByRole('alert').textContent).toContain('Evidence unavailable');expect(screen.queryByText('private internal error')).toBeNull();failed=false;fireEvent.click(screen.getByRole('button',{name:'Retry Evidence'}));expect(screen.getByText('Recovered panel')).toBeTruthy();});
