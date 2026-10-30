# Hero fixtures — simulated demo data

Regenerate from the repo root with `pnpm --filter @stacksense/engine exec tsx scripts/gen-fixtures.ts`.
Every observation is `provenance: "simulated"`. Reviewer drafts are scripted demo inputs with `source: "fallback"` and an explicit unknown noting they are not live model responses. Numbers are prototype outputs, not field accuracy.

- `state-00`: empty case; safety incomplete.
- `state-01`: 402 ceiling and 202 exterior-wall complaints; top check 302 duct photo.
- `state-02`: good photo labels; independent 202 window/efflorescence case.
- `state-03`: explicitly simulated cached weather joins 202 to facade rain and schedules a forecast recheck.
- `state-04`: 502 dry-floor denial; weak evidence against the sunken wet-area source.
- `state-05`: dry 302 duct photo lowers shaft odds; next check 502 meter.
- `state-06`: still 502 meter lowers supply odds; 502 bathroom area probable; Job Sheet derived.
- `state-07`: scripted reviewer asks for a trap photo; evidence cap limits claim to area.
- `state-08`: cracked trap grout photo supports a probable component; scripted review remains labelled fallback.
- `state-09`: Job Sheet sends a waterproofer/tiler, excludes plumber with meter evidence, requires professional flood verification.
- `state-10`: repair followed by day-14 recapture; looks better, dryness unknown, paint not ready without a moisture reading.
- `state-11`: simulated professional finding increments wet-area memory once; 302 and 602 receive inspection suggestions.
- `case-402.json` and `case-202.json`: independent A9 step-6 cases returned by `splitCases`, normalized separately.

Read photo warnings from `recovery.flags`. A real missing-key API call returns fallback chat labels or null Second Opinion, not these scripted reviewer results. `whatIf` recomputes odds, checks, sheet and recovery and invalidates a previous review after changed evidence; B can call the review endpoint again.
