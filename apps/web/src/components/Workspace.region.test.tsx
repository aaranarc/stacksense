import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { Workspace } from './Workspace';
afterEach(cleanup);
it('resets the region to India',()=>{render(<Workspace/>);const region=()=>screen.getByRole('combobox',{name:'Region'}) as HTMLSelectElement;fireEvent.change(region(),{target:{value:'UK'}});expect(region().value).toBe('UK');fireEvent.click(screen.getByRole('button',{name:/^Reset$/}));expect(region().value).toBe('IN');});
