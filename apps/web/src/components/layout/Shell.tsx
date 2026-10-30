import type { ReactNode } from 'react';
export function Shell({feed,building,analysis}:{feed:ReactNode;building:ReactNode;analysis:ReactNode}) {
 return <main className="workspace"><aside className="panel feed-column" aria-label="Case Feed">{feed}</aside><section className="panel building-column" aria-label="Cross-Section">{building}</section><aside className="analysis-column" aria-label="Case analysis">{analysis}</aside></main>;
}
