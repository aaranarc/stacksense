import type {Observation,ReadResult,PhotoLabel} from "../../packages/contracts/src/index";
export type Fields=Pick<Observation,"flatId"|"room"|"zone"|"surface"|"hazards"|"kind">;
export type ScoredCase=({kind:"message";language:string;expected:Record<string,Fields>}|{kind:"photo";expected:{photoId:string;surface:PhotoLabel["surface"];zone:PhotoLabel["zone"];isClean:boolean}[]})&{result:ReadResult;latencyMs:number;costUsd:number|null};
type Counts={tp:number;fp:number;fn:number};
const blank=():Counts=>({tp:0,fp:0,fn:0});
const f1=(n:Counts)=>2*n.tp+n.fp+n.fn?2*n.tp/(2*n.tp+n.fp+n.fn):null;
export function computeAiMetrics(cases:ScoredCase[]) {
 const fields=["flatId","room","zone","surface","hazards","kind"] as const;
 const perField=Object.fromEntries(fields.map(f=>[f,blank()])) as Record<typeof fields[number],Counts>,perLanguage:Record<string,Counts>={};
 let photos=0,correct=0,clean=0,falsePositive=0,abstentions=0;
 for(const item of cases) {
  if(item.kind==="message")for(const [id,reference] of Object.entries(item.expected)){
   const prediction=item.result.observations.find(o=>o.sourceMessageIds.includes(id));
   for(const field of fields){const actual=prediction?.[field],expected=reference[field];const a=new Set(actual==null?[]:Array.isArray(actual)?actual:[String(actual)]),b=new Set(expected==null?[]:Array.isArray(expected)?expected:[String(expected)]);
    const counts={tp:[...a].filter(v=>b.has(v)).length,fp:[...a].filter(v=>!b.has(v)).length,fn:[...b].filter(v=>!a.has(v)).length};
    perLanguage[item.language]??=blank();for(const k of ["tp","fp","fn"] as const){perField[field][k]+=counts[k];perLanguage[item.language]![k]+=counts[k];}
   }
  }
  else for(const reference of item.expected){const p=item.result.photoLabels.find(p=>p.photoId===reference.photoId);photos++;if(p?.surface===reference.surface)correct++;if(!p||p.surface==="unclear")abstentions++;if(reference.isClean){clean++;if(p&&p.surface!=="dry"&&p.surface!=="unclear")falsePositive++;}}
 }
 const costs=cases.map(c=>c.costUsd),known=costs.every((n):n is number=>n!==null);
 return {f1ByField:Object.fromEntries(fields.map(f=>[f,f1(perField[f])])),f1ByLanguage:Object.fromEntries(Object.entries(perLanguage).map(([l,c])=>[l,f1(c)])),photoAccuracy:photos?correct/photos:null,cleanWallFalsePositive:clean?falsePositive/clean:null,photoAbstentions:abstentions,photoCount:photos,cleanPhotoCount:clean,meanCostPerCaseUsd:cases.length&&known?costs.reduce((a,b)=>a+b,0)/cases.length:null,meanLatencyMs:cases.length?cases.reduce((s,c)=>s+c.latencyMs,0)/cases.length:null,unpricedCases:costs.filter(c=>c===null).length,countsByField:perField};
}
export function parseCsv(text:string):Record<string,string>[] {
 const rows:string[][]=[];let row:string[]=[],value="",quoted=false;
 const source=text.replace(/\r\n/g,"\n");
 for(let i=0;i<source.length;i++){const ch=source[i]!;if(ch==='"'){if(quoted&&source[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(ch===","&&!quoted){row.push(value);value="";}else if(ch==="\n"&&!quoted){row.push(value);if(row.some(Boolean))rows.push(row);row=[];value="";}else value+=ch;}
 if(quoted)throw new Error("Unclosed CSV quote");if(value||row.length){row.push(value);rows.push(row);}const headers=rows.shift()??[];
 if(new Set(headers).size!==headers.length)throw new Error("Duplicate CSV columns");
 return rows.map(values=>{if(values.length!==headers.length)throw new Error("CSV width mismatch");return Object.fromEntries(headers.map((h,i)=>[h,values[i]!]));});
}
