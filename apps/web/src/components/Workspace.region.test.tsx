import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { Workspace } from './Workspace';
afterEach(cleanup);
it('resets the region to India',()=>{render(<Workspace/>);const pressed=(name:RegExp)=>screen.getAllByRole('button',{name}).find(b=>b.closest('[aria-label="Region"]'))!.getAttribute('aria-pressed');fireEvent.click(screen.getAllByRole('button',{name:/UK/}).find(b=>b.closest('[aria-label="Region"]'))!);expect(pressed(/UK/)).toBe('true');fireEvent.click(screen.getByRole('button',{name:'Reset case'}));expect(pressed(/IN/)).toBe('true');});
it('shows the old cross-section when the building view is switched to Section',()=>{render(<Workspace/>);expect(screen.getByRole('group',{name:/isometric building view/})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Section'}));expect(screen.getByRole('img',{name:/cross-section/})).toBeTruthy();expect(screen.queryByRole('group',{name:/isometric building view/})).toBeNull();});
