'use client';
import { useEffect,useId,useRef } from 'react';
import type { ReactNode } from 'react';
export function Drawer({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
 const id=useId(),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;ref.current?.querySelector<HTMLButtonElement>('button')?.focus();return ()=>previous?.focus();},[]);
 return <div className="drawer-backdrop"><div className="drawer panel" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=ref.current?.querySelectorAll<HTMLElement>('button,a[href],select,input,textarea,[tabindex="0"]');const first=nodes?.[0],last=nodes?.[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><div className="section-heading"><h2 id={id}>{title}</h2><button onClick={onClose} aria-label={`Close ${title}`}>Close</button></div>{children}</div></div>;
}
