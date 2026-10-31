import {fetchWeather,WEATHER_ATTRIBUTION} from "../src/weather/openMeteo";
import {writeFileSync} from "node:fs";
const specs=[{name:"block-a-jul-aug-2026",input:{lat:19.07,lon:72.88,start:"2026-07-01",end:"2026-08-31"}},{name:"block-a-forecast",input:{lat:19.07,lon:72.88}}];
for(const {name,input} of specs) {
 const data=await fetchWeather(input);
 writeFileSync(new URL(`../../../fixtures-ai/weather/${name}.json`,import.meta.url),JSON.stringify(data,null,2)+"\n");
 console.log(name,data.hourly.length,WEATHER_ATTRIBUTION);
}
