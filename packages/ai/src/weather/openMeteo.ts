import {z} from "zod";
import {RainSeries} from "@stacksense/contracts";
import {jsonResponse,rateLimiter} from "../http/common";
import archive from "../../../../fixtures-ai/weather/block-a-jul-aug-2026.json";
import forecast from "../../../../fixtures-ai/weather/block-a-forecast.json";
export const WEATHER_ATTRIBUTION="Weather data: Open-Meteo (CC-BY 4.0)";
const Input=z.object({lat:z.number().min(-90).max(90),lon:z.number().min(-180).max(180),start:z.string().date().optional(),end:z.string().date().optional()}).refine(x=>!!x.start===!!x.end&&(!x.start||x.start<=x.end!));
const Raw=z.object({utc_offset_seconds:z.number(),hourly:z.object({time:z.array(z.string()),precipitation:z.array(z.number().nonnegative().nullable()),wind_direction_10m:z.array(z.number().nullable()),wind_speed_10m:z.array(z.number().nonnegative().nullable())})});
export async function fetchWeather(input:z.infer<typeof Input>,fetcher:typeof fetch=fetch):Promise<RainSeries> {
 const p=Input.parse(input),query=new URLSearchParams({latitude:String(p.lat),longitude:String(p.lon),hourly:"precipitation,wind_direction_10m,wind_speed_10m",wind_speed_unit:"ms",timezone:"auto"});
 if(p.start){query.set("start_date",p.start);query.set("end_date",p.end!);}else query.set("forecast_days","16");
 const response=await fetcher(`${p.start?"https://archive-api.open-meteo.com/v1/archive":"https://api.open-meteo.com/v1/forecast"}?${query}`,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error("Weather provider unavailable");
 const raw=Raw.parse(await response.json()),h=raw.hourly;
 if([h.precipitation.length,h.wind_direction_10m.length,h.wind_speed_10m.length].some(n=>n!==h.time.length))throw new Error("Mismatched weather arrays");
 const hourly=h.time.flatMap((t,i)=>h.precipitation[i]===null||h.wind_direction_10m[i]===null||h.wind_speed_10m[i]===null?[]:[{t:new Date(Date.parse(t+"Z")-raw.utc_offset_seconds*1000).toISOString(),precipMm:h.precipitation[i]!,windDirDeg:h.wind_direction_10m[i]!,windSpeedMs:h.wind_speed_10m[i]!}]);
 return RainSeries.parse({lat:p.lat,lon:p.lon,source:p.start?"open-meteo-archive":"open-meteo-forecast",hourly});
}
export function createWeatherHandler(kind:"archive"|"forecast") {
 const allowed=rateLimiter();const cache=new Map<string,{until:number;data:RainSeries}>();
 return async(request:Request)=>{
  if(!allowed(request.headers.get("x-forwarded-for")??"unknown"))return jsonResponse({error:"Rate limit exceeded"},429);
  const q=new URL(request.url).searchParams;
  const parsed=Input.safeParse({lat:q.has("lat")?Number(q.get("lat")):NaN,lon:q.has("lon")?Number(q.get("lon")):NaN,...(kind==="archive"?{start:q.get("start"),end:q.get("end")}:{} )});
  if(!parsed.success)return jsonResponse({error:"Valid coordinates and archive dates required"},400);
  const p=parsed.data,key=JSON.stringify(p),hit=cache.get(key);
  if(hit&&hit.until>Date.now())return jsonResponse(hit.data,200,{"X-Weather-Attribution":WEATHER_ATTRIBUTION});
  try {const data=await fetchWeather(p);if(cache.size>=100)cache.delete(cache.keys().next().value!);cache.set(key,{until:Date.now()+900000,data});return jsonResponse(data,200,{"X-Weather-Attribution":WEATHER_ATTRIBUTION});}
  catch {
   const bundled=RainSeries.safeParse(kind==="archive"?archive:forecast);
   if(bundled.success&&Math.abs(p.lat-bundled.data.lat)<.01&&Math.abs(p.lon-bundled.data.lon)<.01&&(!p.start||(p.start==="2026-07-01"&&p.end==="2026-08-31")))return jsonResponse(bundled.data,200,{"X-Weather-Attribution":WEATHER_ATTRIBUTION,"X-Weather-Mode":"cached"});
   return jsonResponse({error:"Weather unavailable",attribution:WEATHER_ATTRIBUTION},503);
  }
 };
}
export const handleWeather=createWeatherHandler("archive");
export const handleForecast=createWeatherHandler("forecast");
