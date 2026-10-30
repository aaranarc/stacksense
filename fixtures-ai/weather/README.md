# Weather caches

Weather data: Open-Meteo (CC-BY 4.0). Sources: https://open-meteo.com/en/docs and https://open-meteo.com/en/docs/historical-weather-api .

block-a-jul-aug-2026.json contains 1488 real archive hours for the requested July–August interval. block-a-forecast.json contains the 384-hour forecast fetched during A-T19. API local times are converted to UTC using utc_offset_seconds. Forecast snapshots age; refresh before a demo with `pnpm --filter @stacksense/engine exec tsx ../ai/scripts/cache-weather.ts`.

The hero-*.simulated.json files have source fixture and are explicitly simulated weather for reproducible rain/forecast tests, not observed Open-Meteo data.
