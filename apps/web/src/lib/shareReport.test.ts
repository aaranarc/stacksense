import {expect,it} from 'vitest';
import {reportLink,readReport} from './shareReport';
import {demo} from './adapters';
it('shares a portable validated snapshot without chat or private photo identifiers',()=>{
 const state=demo.states[9]!,link=reportLink('https://example.invalid',state,true),read=readReport(new URL(link).hash);
 expect(read.job.caseId).toBe(state.caseId);expect(read.demoData).toBe(true);
 expect(read.job.evidencePhotoIds).toEqual([]);
 expect(read).not.toHaveProperty('observations');expect(read).not.toHaveProperty('building');
 expect(()=>readReport('#broken')).toThrow();
});

it('rejects active-content links in an untrusted shared snapshot',()=>{
 const state=structuredClone(demo.states[9]!);state.jobSheet!.responsibilityLinks=[{label:'Injected link',url:'javascript:alert(1)'}];
 expect(()=>readReport(new URL(reportLink('https://example.invalid',state,false)).hash)).toThrow();
});
