# B final acceptance — 31 October 2026

Branch: b/app. Changes stay in B-owned app files plus the authorized shared integration log. C's judge components, packages, API routes and root configuration are unchanged.

## Local acceptance

- Mock engine and API flags off. Production build served at localhost:3011.
- Chrome 156.0.8078.74: 59 assertions/check groups passed; zero uncaught JavaScript errors and zero unexpected console errors.
- Desktop hero and 390 x 844 dashboard, all tab accordions/drawers, all eight Judge scenarios, styleguide comparison and resident consent/safety/camera/done/error screens have no horizontal page overflow.
- Visible button/select/file/number/range targets checked at 44 px; visible images have alt text. Drawer Tab containment, Escape after asynchronous focus loss, stacked drawers, focus restoration and comparison-slider focus checked.
- Real parse/pseudonymise/read demo path returns Cached. B-003b's original attachment filenames load actual ceiling/window thumbnails and PhotoViewer images. Four Judge hero photos also load.
- Encoded-colon print URL is populated and enabled. The generated hero PDF is one approximately A4 page (594.96 x 841.92 pt), with a Demo data label and the exact probable-source footer; rendered page inspected for clipping and legibility.
- IN/UK/IN restores the case and Job Sheet; Rain/Memory/Slab, eligible 602 inspection, evidence correction, Dry & Paint, 35% ghost overlay and labelled edge contrast checked.
- /c/demo completes in the iframe and standalone. Demo completion does not alter dashboard evidence; an answered hazard stops before the camera. Deliberate read failures and invalid tokens display labelled errors without raw JSON.

Unit/schema validation: recursive typecheck and tests, plus web production build. Web suite contains 93 tests (workspace total 249: contracts 3, AI 66, engine 87, web 93).

## Signed branch-preview integration

Final app-source commit **3ee1c376611184be563a21e83ca75c8b47fbb74a** received a successful Vercel status before the branch preview was tested. The full suite passed **61 check groups**, zero uncaught JavaScript errors and zero unexpected console errors at https://stacksense-git-b-app-byte-me21.vercel.app, including B-003b's two actual thumbnails/full photos.

Separate owner and resident browser contexts verified signed link creation, owner cookie, unauthorized updates rejected with 403/no-store, authorized updates 200/no-store, clean cached duct upload, automatic dashboard update, frame dismissal and repeat-refresh deduplication. WhatsApp navigation was intercepted; no message was sent. Deployment status: https://vercel.com/byte-me21/stacksense/862Ga2ejfGWpJgHrghPdytN7syB2 . The later acceptance-note commit changes documentation only; this is the app-source SHA tested.

The upload runner verifies the exact cleaned photo bytes, current prompt versions and check context against A's bundled cache before sending; it refuses an unknown input. No uncached quota or accuracy probe was run. Cached/Demo labels remain visible. Browser emulation is not a physical-device recording.

## Reproduce the browser pass

From the repository root, with installed Chrome and the usual app dependencies:

```powershell
npm install --prefix apps/web/node_modules/.cache/final-qa playwright-core@1.64.1 --no-package-lock --no-audit --no-fund
pnpm --filter web build
pnpm --filter web start --port 3011
```

In another terminal:

```powershell
$env:QA_BASE_URL='http://localhost:3011'
$env:QA_OUTPUT_DIR='apps/web/node_modules/.cache/final-qa/local'
node apps/web/scripts/final-browser-check.mjs
```

For the configured branch preview, set QA_BASE_URL to its deployed URL. Set QA_SIGNED_FLOW=1 to include the guarded cloud roundtrip. QA_EXPORT_PDF=1 exports the QA print PDF. Reports, screenshots, temporary Playwright installation and PDFs stay ignored under node_modules/.cache/final-qa. Signed URLs are redacted in the report; no owner cookie is printed.

## C / human handoff

C has reconciled Day-14 upload kind with engine recovery in e5ce92a and restored post-repair recapture-link availability in 413cfea, with regression tests. C's final main commit 76d889b includes B's work and records the production checklist passing; the exact main SHA has a successful Vercel status. B incorporated those commits without modifying C/A code. The production check created a recapture link but deliberately did not upload a post-repair photo; regression coverage must not be described as that real upload. Human recordings, physical-device checks and video/submission remain pending work. C owns release decisions and evaluation labels.

After incorporating main 76d889b, B independently reran the full ordinary browser suite against https://stacksense-omega.vercel.app: all 59 check groups passed, with zero uncaught JavaScript errors and zero unexpected console errors. This includes B-003b's actual chat photos, populated print route, eight scenarios, region restore and the resident demo at 390 px. No signed cloud upload was repeated in this production pass. Recursive typecheck and all 253 tests passed (contracts 3, AI 67, engine 89, web 94), including C's new recapture regressions. The web production build also passes.
