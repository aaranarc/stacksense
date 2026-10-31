import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { CrossSection } from './CrossSection';
import { demo } from '../../lib/adapters';
import {renderToStaticMarkup} from 'react-dom/server';
afterEach(cleanup);
it('renders a single title text node for server hydration',()=>{expect(renderToStaticMarkup(<CrossSection state={demo.states[0]!} selected={null} onSelect={()=>{}}/>)).toContain('<title>Block A · building cross-section</title>');});
it('renders every flat from the building and exposes dated dry evidence',()=>{const select=vi.fn();render(<CrossSection state={demo.states[5]!} selected={null} onSelect={select}/>);expect(screen.getAllByRole('button')).toHaveLength(12);fireEvent.click(screen.getByRole('button',{name:/302 · duct dry · 31 Oct/}));expect(select).toHaveBeenCalledWith('302');expect(screen.getByRole('button',{name:/402 · victim/})).toBeTruthy();});
