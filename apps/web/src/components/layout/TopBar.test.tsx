import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {TopBar} from './TopBar';
afterEach(cleanup);
it('offers case reset, an IN | UK region toggle and a demo-data chip',()=>{const reset=vi.fn(),region=vi.fn();render(<TopBar onReset={reset} onRegion={region} region="IN" demoData/>);fireEvent.click(screen.getByRole('button',{name:'Reset case'}));expect(reset).toHaveBeenCalledOnce();const uk=screen.getByRole('button',{name:/UK/});expect(screen.getByRole('button',{name:/IN/}).getAttribute('aria-pressed')).toBe('true');fireEvent.click(uk);expect(region).toHaveBeenCalledWith('UK');expect(screen.getByText('Demo data')).toBeTruthy();});
