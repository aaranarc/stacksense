import type {RainSeries,Hypothesis} from '@stacksense/contracts';
type Wall=NonNullable<Hypothesis['orientation']>;
const normal:Record<Wall,number>={N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315};
// A display index from weather measurements, never a diagnostic probability.
export function dailyRain(series:RainSeries,wall:Wall){const days=new Map<string,number>();for(const row of series.hourly){const date=row.t.slice(0,10),value=row.precipMm*Math.max(0,Math.cos((row.windDirDeg-normal[wall])*Math.PI/180))*row.windSpeedMs;days.set(date,(days.get(date)??0)+value);}return [...days].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value}));}
