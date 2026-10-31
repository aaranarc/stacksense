import {expect,it,vi} from "vitest";
import {fetchWeather,createWeatherHandler} from "../src/weather/openMeteo";
it("A-T19 validates hourly arrays, units, offsets and forecast parameters",async()=>{
 const fetcher=vi.fn(async(_url:RequestInfo|URL)=>Response.json({utc_offset_seconds:19800,hourly:{time:["2026-10-30T10:00"],precipitation:[2],wind_direction_10m:[270],wind_speed_10m:[3]}}));
 const s=await fetchWeather({lat:19.07,lon:72.88,start:"2026-07-01",end:"2026-08-31"},fetcher as typeof fetch);
 expect(s.hourly[0]?.t).toBe("2026-10-30T04:30:00.000Z");expect(String(fetcher.mock.calls[0]?.[0])).toContain("wind_speed_unit=ms");
 await fetchWeather({lat:19.07,lon:72.88},fetcher as typeof fetch);expect(String(fetcher.mock.calls[1]?.[0])).toContain("forecast_days=16");
 expect((await createWeatherHandler("archive")(new Request("http://localhost/api/weather?lat=999&lon=0"))).status).toBe(400);
});
