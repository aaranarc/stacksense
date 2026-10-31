import { render,fireEvent,screen,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { TopBar } from './TopBar';
afterEach(cleanup);
it('offers reset and an accessible Judge Mode toggle',()=>{const reset=vi.fn(),judge=vi.fn();render(<TopBar judge={false} onJudge={judge} onReset={reset} onScenario={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'Reset'}));fireEvent.click(screen.getByRole('button',{name:'Judge Mode'}));expect(reset).toHaveBeenCalledOnce();expect(judge).toHaveBeenCalledOnce();expect(screen.getByRole('button',{name:'Judge Mode'}).getAttribute('aria-pressed')).toBe('false');});
