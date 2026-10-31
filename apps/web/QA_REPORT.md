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

The configured b/app preview previously passed separate owner and resident browser contexts: signed link creation, owner cookie, unauthorized updates rejected with 403/no-store, authorized updates 200/no-store, clean cached duct upload, automatic dashboard update, frame dismissal and repeat-refresh deduplication. WhatsApp navigation was intercepted; no message was sent. Final app-source preview acceptance is reported in the integration log after deployment.

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

C must reconcile Day-14 upload kind with engine recapture handling (INTEGRATION_BUGS.md), merge/retest main and retain honest pending evaluation labels. B did not modify C/A code. A real post-repair signed recapture roundtrip has not passed. Human recordings, physical-device checks, video/submission and the final release are separate pending work.
