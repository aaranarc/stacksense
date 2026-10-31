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

## B-001 — OPEN — demo import blocked by browser adapter

Owner: **B**. Priority: P0 for the hero import flow.

Reproduce: open production, click **Load demo chat**. The textarea fills, then displays **“Private browser preparation is unavailable. Use demo mode until it is connected.”** The case remains empty; the building does not light up from chat. Judge scenario playback separately works.

Cause confirmed in `apps/web/src/lib/adapters.ts` and `importChat.ts`: `browser` still spreads mock preprocessing and sets `available: USE_MOCK_API`; `readChat` rejects when real APIs are selected. Wire the actual `@stacksense/ai/browser` functions, adapting their return shapes, and retain browser-local keyMap privacy. Do not enable mock APIs to hide this defect: direct deployed /api/read already succeeds. A has not edited B's files.

## A-001 — OPEN — deployed demo token disabled

Owner: **A (Vercel configuration)**. Priority: P1.

Reproduce: open `/c/demo` at 390×844. It displays **“This link has expired or was already used. Ask for a new link.”**, with Retry; consent/safety screens are unavailable.

Vercel's project variable list has no `NEXT_PUBLIC_DEMO_MODE`. B's `residentApi.isDemo` intentionally requires that flag or mock API mode before using the labelled cached demo token. Set `NEXT_PUBLIC_DEMO_MODE=true` for Production/Preview and rebuild/redeploy, then retest. This affects only the explicit demo token; signed resident links continue through their server verification.

## Ownership and next checkpoint

No C-owned failure was observed in the requested checks. Raw team photographs remain ignored. Screenshots are local in `work/cp1-hero.png` and `work/cp1-mobile-failure.png`. After the user says **CP2 merge**, repeat fetch; merge origin/a/core, then origin/b/app, then origin/c/help into main; use B's version on conflicts in B-owned web files, C's in components/judge, preserve sharp; install/typecheck/test/build; push only green; wait for the exact main deployment; repeat all five production checks and update this log.
