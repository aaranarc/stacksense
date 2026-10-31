import type {Observation} from '@stacksense/contracts';
type Hazard=Observation['hazards'][number];
const patterns:Record<Hazard,RegExp>={
 water_near_electrics:/\b(?:spark\w*|sockets?|switch(?:es)?|light fitting|current|shocks?|bijli|karant|electrics)\b|करंट|बिजली/gi,
 sagging_ceiling:/\b(?:sagging|bulging|jhuk\w*|gir raha|collapse\w*)\b/gi,
 fast_ingress:/\b(?:gushing|tez paani|flooding|fast (?:water )?ingress|coming in fast)\b/gi,
 sewage:/\b(?:sewage|gutter|naala|drain overflow)\b|मैला/gi,
};
// Negation is local to a clause and a hazard mention. Uncertainty never clears a hazard.
const before=/(?:\bno(?:\s+(?:signs?|evidence))?(?:\s+of)?|\bnot|\bwithout|\bneither|\bdenies?)\s+(?:(?:water|near|any|the|a|an|ceiling|is|are|visible|smell|of|or)\s+){0,6}$/i;
const after=/^\s*(?:(?:smell|ceiling|water)\s+)?(?:(?:is|was|are)\s+)?(?:absent\b|not\s+(?:present|seen|detected|reported)\b|nahi\b|nahin\b|नहीं|नाही)/i;
const coordinated=/^\s*(?:(?:smell|ceiling|water)\s+)?(?:or|nor)\s+(?:(?:water|near|any|the|ceiling|visible)\s+)*$/i;
export function textHazards(text:string):{hazards:Hazard[];denied:Hazard[]} {
 const positive=new Set<Hazard>(),negative=new Set<Hazard>();
 const normalized=text.replace(/[’]/g,"'").replace(/\b(is|are|was|were|has|have|do|does|did)n't\b/gi,'$1 not');
 for(const clause of normalized.split(/(?<=[.!?;,\n])|\b(?:but|however|yet|although|and)\b/i)) {
  const mentions=Object.entries(patterns).flatMap(([hazard,pattern])=>[...clause.matchAll(new RegExp(pattern))].map(match=>({hazard:hazard as Hazard,start:match.index!,end:match.index!+match[0].length}))).sort((a,b)=>a.start-b.start);
  const uncertain=/\?|\b(?:unsure|uncertain|not sure|maybe|might|cannot|can't|could|possibly)\b/i.test(clause);
  let previous:{end:number;denied:boolean}|undefined;
  for(const match of mentions){
   const prefix=clause.slice(0,match.start),suffix=clause.slice(match.end);
   const denied=!uncertain&&(before.test(prefix)||after.test(suffix)||!!(previous?.denied&&coordinated.test(clause.slice(previous.end,match.start))));
   (denied?negative:positive).add(match.hazard);previous={end:match.end,denied};
  }
 }
 return {hazards:Object.keys(patterns).filter(h=>positive.has(h as Hazard)) as Hazard[],denied:[...negative].filter(h=>!positive.has(h))};
}
