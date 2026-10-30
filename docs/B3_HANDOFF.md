# B3 handoff

Live chat/review verified locally using GEMINI_MODEL=gemini-3.1-flash-lite; the default model was temporarily at capacity. Keys remain server-only.

- Weather: GET /api/weather?lat=19.07&lon=72.88&start=2026-07-01&end=2026-08-31 and GET /api/forecast?lat=19.07&lon=72.88 return RainSeries. Display the X-Weather-Attribution value. Pass rain/forecast into applyObservations.
- Scenarios: all eight records and runScenario are exported. Scenario records optionally include photoLabels/review for deterministic demo inputs; carry those during replay. All are simulated.
- Simulator: simulateBuilding(seed) now returns building/truth/answer plus initialObservation/victimFlatId. Start a case with initialObservation; use answer only for simulator controls, never as real evidence. Perturbation is optional and does not change the inference tables.
- Prediction: read prediction.sameStack/forecastRechecks/seasonal. Memory GET /api/memory?buildingId=...; POST JSON {buildingId,family,eventKey}. Persist counts in localStorage when fallback=true; server memory alone is process-local. The eventKey must identify the same professional finding across retries.
- Link creation: POST /api/link with {caseId,checkId,flatId,lang,state}; state is the latest engine snapshot, needed for a newly created browser case. The shared LinkRequest type remains unchanged. Store the returned URL; open waUrl only at the resident's request.
- Verify: GET /api/link/verify?token=... returns bound check details and a private 10-minute ghostPhotoUrl when a matching previous spot exists.
- Upload: POST multipart /api/upload with token, photo, consent="true", safety=JSON.stringify({water_near_electrics:false,sagging_ceiling:false,fast_ingress:false,sewage:false}). A meter check also requires photo2 and minutes. All four questions must really have been answered; do not prefill consent/safety for real users. Apply returned observations and photoLabels to the engine. Used/expired links return 410. Unreadable digits produce no guessed reading.

## Supabase setup still required

Run packages/ai/supabase/migrations/001_init.sql in the Supabase SQL editor. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to apps/web/.env.local and Vercel; copy the locally generated MAGIC_LINK_SECRET to Vercel. Set APP_ORIGIN to the canonical deployment origin for shared links. Restart/redeploy after environment changes. No secret uses NEXT_PUBLIC_.

The migration was validated locally, not run against your account. Cloud links/uploads and real-photo mobile preview verification remain pending Supabase configuration and an actual photo. No real resident photo or deployed preview was available during implementation. The provided unit integration uses explicitly synthetic meter images.

A-T24 is not implemented or run, and eval/hard-cases is untouched. AI runner smoke data will be labelled placeholder and must not be used as evaluation-card results.

Case privacy: create browser cases with a unique ID, e.g. createCase(building, {caseId: crypto.randomUUID(), now: new Date().toISOString()}). The link route sets an HttpOnly, Secure, SameSite=Strict owner cookie. Same-origin fetch sends it automatically; a different browser cannot replace an existing case or issue more links for it. Recipients still need only their signed check token. Do not use a single predictable case ID for all visitors. The cookie is an implementation detail, not an extra login step.

## A-T25 runner code

Run `pnpm --filter @stacksense/engine exec tsx ../../eval/runner-ai/run.ts --placeholder` from the repo root. It writes eval/results/ai.placeholder.json: five synthetic cases, no human review and zero provider calls. The label forbids interpreting these values as field accuracy; no public eval-card file is written. The runner code computes field/language F1, surface accuracy, clean-wall false-positive rate, abstentions, latency and token-rate cost estimates (null when unknown). Live runs require an explicitly human-reviewed, non-placeholder dataset and opt-in. See eval/runner-ai/README.md for the schema and command.
