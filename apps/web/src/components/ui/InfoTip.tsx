'use client';
import { useId } from 'react';
import { Info } from 'lucide-react';
/** Small ⓘ button with a tooltip on hover and keyboard focus. */
export function InfoTip({ text }: { text: string }) {
  const id = useId();
  return <span className="info-tip"><button type="button" className="icon-btn sm" aria-label="About this card" aria-describedby={id}><Info size={15} aria-hidden="true" /></button><span role="tooltip" id={id}>{text}</span></span>;
}
