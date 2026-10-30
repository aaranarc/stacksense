# Hero fixtures — simulated demo data

Regenerate from the repo root with `pnpm --filter @stacksense/engine exec tsx scripts/gen-fixtures.ts`.
Every observation is marked `provenance: "simulated"`. These are prototype outputs, not field accuracy.

- `state-00`: empty case, safety incomplete.
- `state-01`: 402 ceiling and 202 exterior-wall complaints; top check 302 duct photo.
- `state-02`: good photo labels; 202 window efflorescence supports a separate facade case.
- `state-03`: reuses 02; weather joining belongs to A-T19 and has not run.
- `state-04`: 502 dry-floor denial; weak evidence against a sunken wet-area leak.
- `state-05`: dry 302 duct photo; shaft odds fall, next check 502 meter.
- `state-06`: still 502 meter; supply odds fall, probable 502 bathroom area exceeds 80%.
- `state-07` through `state-11`: reuse 06 until the later tasks implement review, component evidence, Job Sheet, recovery and prediction. They contain no invented later results.
- `case-402.json` and `case-202.json`: independent final case states returned by `splitCases`; probabilities normalize separately. A dry 302 is present in the observation ledger for the app to show.

Second Opinion and Job Sheet remain null; paint remains not ready. The primary return value is 402; call `splitCases(state)` for the linked 202 facade case. Photo warnings use `recovery.flags` under the unchanged contract.
