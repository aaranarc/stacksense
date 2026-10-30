import { render,screen,cleanup } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { SafetyBoundary } from './SafetyBoundary';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('shows only engine emergency actions and makes diagnosis inert',()=>{render(<SafetyBoundary state={demo.emergency}><button>Send link</button></SafetyBoundary>);expect(screen.getByRole('alert').textContent).toContain('Diagnosis stopped for safety.');expect(screen.getByText(demo.emergency.safety.actions[0]!)).toBeTruthy();expect(screen.getByLabelText('Diagnosis stopped for safety').hasAttribute('inert')).toBe(true);});
it('never calls unanswered safety questions safe',()=>{render(<SafetyBoundary state={demo.states[0]!}>Case</SafetyBoundary>);expect(screen.getByRole('status').textContent).toBe('Safety questions unanswered — not marked safe.');});
