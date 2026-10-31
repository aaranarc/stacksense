# CP1 integration checks

Production: https://stacksense-omega.vercel.app/

Merged A `9fe98e0`, B `30823b2`, C `997e9ce`, in that order, into main `813d535`. No content conflicts. A's sharp dependency/dynamic import/serverExternalPackages are preserved. Install, typecheck, 180 tests, and web build passed. Vercel's GitHub status for this exact main SHA became success: https://vercel.com/byte-me21/stacksense/Hos2dkHJyc8Jik3Gevgw3eBn1PFi . The following checks were on deployed production, not localhost.

| Check | Result |
| --- | --- |
| Page loads without login | PASS: 200, StackSense app |
| Load demo chat → building lights up | FAIL: B-001 |
| POST /api/read with canonical hero | PASS: 200, cached, 5 observations, no warnings |
| Judge Mode → hero completion | PASS: step 6/6, Job Sheet sends waterproofer_tiler (displayed as “waterproofer tiler”) |
| /c/demo at actual viewport 390×844 | FAIL: A-001 |

## B-001 — FIXED on b/app — verified locally and on branch preview

Owner: **B**. Priority: P0 for the hero import flow.

Reproduce: open production, click **Load demo chat**. The textarea fills, then displays **“Private browser preparation is unavailable. Use demo mode until it is connected.”** The case remains empty; the building does not light up from chat. Judge scenario playback separately works.

Cause confirmed in `apps/web/src/lib/adapters.ts` and `importChat.ts`: `browser` still spreads mock preprocessing and sets `available: USE_MOCK_API`; `readChat` rejects when real APIs are selected. Wire the actual `@stacksense/ai/browser` functions, adapting their return shapes, and retain browser-local keyMap privacy. Do not enable mock APIs to hide this defect: direct deployed /api/read already succeeds. A has not edited B's files.

B resolution: real parsing and pseudonymisation are connected; keyMap is never transmitted. Text-only imports skip both photo helpers. Metadata failures omit the unsafe photo with a labelled warning; quality failures retain only the stripped photo with a warning. Bundled demo text and its sanitised fallback match the canonical request. Both local mock flags are false. Local UI regression passes (Load demo chat → 402 victim); local `/api/read` returns 200 with five observations and a labelled fallback because this checkout has no provider key. Web typecheck, tests and production build pass. Branch-preview verification follows the push.

Preview verification for `d2a3787`: GitHub Vercel status success; https://stacksense-git-b-app-byte-me21.vercel.app/ returns 200, canonical demo text matches, `/api/read` returns cached with five observations, and the deployed page bundle contains the new preparation warnings and no old blocking gate. Automated browser control could not initialise (missing runtime asset path), so remote UI clicks were not verified; the local UI click regression passes.

## A-002 — OPEN — prevention inspection links have no matching ranked check

Owner: A. Next Leak renders engine `prediction.sameStack` entries, but the current check catalogue targets the victim/above/below flats only. `/api/link` requires a matching eligible `nextChecks` entry. This leaves new same-stack targets such as 602 without a creatable inspection link. B disables that unavailable action and labels it; B does not invent checks or bypass endpoint validation. Please expose an eligible inspection check or a supported prediction-link request.

## A-001 — OPEN — deployed demo token disabled

Owner: **A (Vercel configuration)**. Priority: P1.

Reproduce: open `/c/demo` at 390×844. It displays **“This link has expired or was already used. Ask for a new link.”**, with Retry; consent/safety screens are unavailable.

Vercel's project variable list has no `NEXT_PUBLIC_DEMO_MODE`. B's `residentApi.isDemo` intentionally requires that flag or mock API mode before using the labelled cached demo token. Set `NEXT_PUBLIC_DEMO_MODE=true` for Production/Preview and rebuild/redeploy, then retest. This affects only the explicit demo token; signed resident links continue through their server verification.

## Ownership and next checkpoint

No C-owned failure was observed in the requested checks. Raw team photographs remain ignored. Screenshots are local in `work/cp1-hero.png` and `work/cp1-mobile-failure.png`. After the user says **CP2 merge**, repeat fetch; merge origin/a/core, then origin/b/app, then origin/c/help into main; use B's version on conflicts in B-owned web files, C's in components/judge, preserve sharp; install/typecheck/test/build; push only green; wait for the exact main deployment; repeat all five production checks and update this log.

## A-003 — OPEN — physical-phone answers need a dashboard refresh channel

Owner: A for an owner-authorised read/subscription API; B for consuming it once available. The upload handler stores the resident observation, but the current API routes provide no case refresh endpoint or subscription for the secretary's open dashboard. B-T23 accepts same-origin answers from its active phone iframe, with token/source validation. A separate physical phone cannot use that iframe channel. Please expose a supported refresh/subscription contract; do not bypass owner authorisation. The phone simulator can be recorded meanwhile. This does not prevent completing the resident upload itself.

## B handoff for CP2

B-001 and B-T21 through B-T27 are implemented on b/app. The mock engine/API flags are off locally; cached illustrations and scenarios remain explicitly labelled Demo data. C-owned judge files, A-owned packages/API routes and build tooling are unchanged. B's final web validation has 67 passing tests; the production build and full-workspace checks are recorded in the chat. Remote browser control could not initialise, so a visual preview click-through remains a human check. A-001, A-002 and A-003 require A-owned configuration/API work.
