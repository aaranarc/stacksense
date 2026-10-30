import type {Building,Observation,RainSeries,EngineState,Flat} from "@stacksense/contracts";
import type {Feature} from "./tables/likelihoods";
export type WeatherState=EngineState&{weather?:{rain?:RainSeries;forecast?:RainSeries}};
const normal:Record<Flat["externalWalls"][number],number>={N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315};
export function windDrivenRain(row:RainSeries["hourly"][number],wall:Flat["externalWalls"][number]):number {
 return row.precipMm*Math.max(0,Math.cos((row.windDirDeg-normal[wall])*Math.PI/180))*row.windSpeedMs;
}
const percentile=(xs:number[])=>[...xs].sort((a,b)=>a-b)[Math.floor((xs.length-1)*.75)]??0;
export function rainFeature(obs:Observation,building:Building,series:RainSeries):Feature|null {
 if(!["external_wall","window_perimeter"].includes(obs.zone)) return null;
 const walls=building.flats.find(f=>f.id===obs.flatId)?.externalWalls??[];
 const rows=[...series.hourly].sort((a,b)=>a.t.localeCompare(b.t)); const time=Date.parse(obs.at);
 if(!rows.length||time<Date.parse(rows[0]!.t)||time>Date.parse(rows.at(-1)!.t)+3600000) return null;
 let known=false;
 for(const wall of walls) {
  const previous=rows.filter(r=>Date.parse(r.t)<=time); if(!previous.length) continue;known=true;
  // Baselines end no later than the observation: future weather never informs a report.
  const totals=previous.map((r,i)=>previous.slice(Math.max(0,i-71),i+1).reduce((sum,x)=>sum+windDrivenRain(x,wall),0));
  const actual=previous.filter(r=>Date.parse(r.t)>time-72*3600000).reduce((sum,r)=>sum+windDrivenRain(r,wall),0);
  if(actual>percentile(totals)) return "follows_rain_on_facade";
 }
 return known?"no_rain_link":null;
}
export function forecastRechecks(state:EngineState,forecast:RainSeries):EngineState["prediction"]["forecastRechecks"] {
 if(state.safety.status!=="ok") return [];
 const result:EngineState["prediction"]["forecastRechecks"]=[],seen=new Set<string>();
 for(const obs of state.observations) {
  if(!obs.flatId||!["external_wall","window_perimeter"].includes(obs.zone)) continue;
  for(const wall of state.building.flats.find(f=>f.id===obs.flatId)?.externalWalls??[]) {
   const key=`${obs.flatId}:${wall}`;if(seen.has(key))continue;seen.add(key);
   const daily=new Map<string,number>();
   for(const row of forecast.hourly) if(Date.parse(row.t)>=Date.parse(state.now)) {const day=row.t.slice(0,10);daily.set(day,(daily.get(day)??0)+windDrivenRain(row,wall));}
   const threshold=percentile([...daily.values()]);
   const next=[...daily].sort(([a],[b])=>a.localeCompare(b)).find(([,value])=>value>threshold);
   if(next) result.push({flatId:obs.flatId,orientation:wall,afterDate:next[0],why:`re-check ${obs.flatId} after ${new Date(next[0]+"T12:00:00Z").toLocaleDateString("en",{weekday:"short",timeZone:"UTC"})} heavy rain — ${wall} wall`});
  }
 }
 return result;
}
