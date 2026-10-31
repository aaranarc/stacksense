'use client';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Dashboard card: numbered header (blue, or amber for Safety and Predict), fade-up on first load. */
export function Card({ id, step, tone = 'blue', title, subtitle, actions, children, className = '', index = 0, dark = false }:
  { id: string; step?: number; tone?: 'blue' | 'amber'; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; index?: number; dark?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.section id={id} className={`card ${dark ? 'card-dark ' : ''}${className}`} aria-labelledby={`${id}-title`}
    initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease: 'easeOut', delay: reduced ? 0 : index * .04 }}>
    <header className="card-head">
      {step !== undefined && <span className={`step-dot ${tone}`} aria-hidden="true">{step}</span>}
      <div className="card-titles"><h2 id={`${id}-title`}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {actions && <div className="card-actions">{actions}</div>}
    </header>
    {children}
  </motion.section>;
}

/** Our own wordmark: three stacked wave strokes. */
export function Logo({ size = 34 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" className="logo-mark">
    <path d="M4 10.5c4.5-4 9-4 13.5 0s9 4 14.5 0" stroke="#2563EB" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <path d="M4 18c4.5-4 9-4 13.5 0s9 4 14.5 0" stroke="#3B82F6" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M4 25.5c4.5-4 9-4 13.5 0s9 4 14.5 0" stroke="#60A5FA" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity=".65" />
  </svg>;
}
