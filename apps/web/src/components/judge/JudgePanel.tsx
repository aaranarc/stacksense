'use client';
import { useState } from 'react';
import type { EngineState } from '@stacksense/contracts';
import { ScenarioPicker } from './ScenarioPicker';
import { EvalCard } from './EvalCard';
import { HowItDecided } from './HowItDecided';
import { BreakIt } from './BreakIt';
import s from './judge.module.css';

// shortcut: B's WhatIfSliders (@/components/whatif/WhatIfSliders) is not pushed yet — swap this placeholder for
// `<WhatIfSliders state={state} onState={onState} />` when it lands.
function WhatIfPlaceholder() {
  return <p className={s.small}>What-if sliders — coming from B</p>;
}

export function JudgePanel({ state, onState }: { state: EngineState; onState: (s: EngineState) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  // At phone width (≤480 px) the panel is a bottom sheet; the collapse button only shows there.
  return <aside className={`panel ${s.panel} ${collapsed ? s.collapsed : ''}`} aria-label="Judge Mode">
    <div className={s.sheetHead}>
      <p className="eyebrow">JUDGE MODE</p>
      <button className={s.sheetToggle} aria-expanded={!collapsed} aria-controls="judge-body" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? 'Show panel ▴' : 'Hide panel ▾'}
      </button>
    </div>
    <div id="judge-body" className={s.body}>
    <details open><summary>What-if</summary><WhatIfPlaceholder /></details>
    <details open><summary>Scenarios</summary><ScenarioPicker onState={onState} /></details>
    <details><summary>Evaluation</summary><EvalCard /></details>
    <details><summary>How it decided</summary><HowItDecided state={state} /></details>
    <details><summary>Break it</summary><BreakIt onState={onState} /></details>
    </div>
  </aside>;
}
