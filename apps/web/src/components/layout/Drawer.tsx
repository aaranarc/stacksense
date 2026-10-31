'use client';
import { useEffect,useId,useRef } from 'react';
import type { ReactNode } from 'react';
const openDrawers:string[]=[];let previousOverflow='';
export function Drawer({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
 const id=useId(),ref=useRef<HTMLDivElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  if(!openDrawers.length){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  openDrawers.push(id);ref.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({preventScroll:true});
  function keydown(event:KeyboardEvent){
   if(openDrawers.at(-1)!==id)return;
   if(event.key==='Escape'){event.preventDefault();close.current();return;}
   if(event.key!=='Tab')return;
   const nodes=[...(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],select:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')??[])].filter(node=>node.getClientRects().length>0&&!node.closest('[hidden],[inert],[aria-hidden="true"]'));
   const first=nodes[0],last=nodes.at(-1),outside=!ref.current?.contains(document.activeElement);
   if(!first){event.preventDefault();ref.current?.focus();}
   else if(event.shiftKey&&(document.activeElement===first||outside)){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||outside)){event.preventDefault();first.focus();}
  }
  document.addEventListener('keydown',keydown);
  return()=>{document.removeEventListener('keydown',keydown);const wasTop=openDrawers.at(-1)===id;const index=openDrawers.indexOf(id);if(index>=0)openDrawers.splice(index,1);if(!openDrawers.length)document.body.style.overflow=previousOverflow;if(wasTop&&previous?.isConnected)previous.focus({preventScroll:true});};
 },[id]);
 return <div className="drawer-backdrop"><div className="drawer panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} ref={ref}><div className="section-heading"><h2 id={id}>{title}</h2><button onClick={onClose} aria-label={`Close ${title}`}>Close</button></div>{children}</div></div>;
}
