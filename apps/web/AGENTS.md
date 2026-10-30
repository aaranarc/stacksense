# apps/web — person B
Scope: apps/web/** EXCEPT src/app/api/** and public/eval/** (person A). Also eval/hard-cases/**.
Never edit packages/** or root config.

- Import engine and API ONLY through src/lib/adapters.ts. Types from @stacksense/contracts.
- The UI never computes odds, checks, trades or statuses. It renders EngineState.
- Colours only via src/lib/visual.ts: grey not assessed · amber suspected/inspect · red leading source ·
  green+date check passed · solid documented · dashed hypothetical · max 3 colours + grey · every colour
  has a text label · animate only when odds change.
- Calm by default: on screen = case feed, cross-section, bars, next check, Second Opinion line, 3 tabs.
  Everything else one click away (modal / drawer / pill / Judge Mode).
- Wording: "probable source", never "guilty". Responsibility = links only. Always show Live/Cached/Fallback
  and "Demo data" badges. No raw JSON in the UI. No money figures.
- Next.js App Router + TypeScript + Tailwind + Framer Motion. Must work at 390 px wide.
- Before every commit: pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build.
- Commit "[app] <TASK-ID> <summary>", push origin b/app.
