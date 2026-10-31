# App decisions

- B-T17: `/c/demo` uses labelled cached check results and does not upload a real resident photo. Real-token flows use A's browser EXIF/quality helpers and `/api/upload`, after explicit consent and all four negative safety answers. Each token starts a fresh flow. C's published JudgePanel hookup is copied unchanged. C's reported CrossSection title hydration bug is fixed in B's component.

- B-T16: The WhatIfSliders export lives in components/whatif. C's judge folder is copied byte-for-byte for integration and remains read-only. JudgePanel still owns its placeholder replacement; B only wires the panel in Workspace. A's sharp dependency/configuration fix is merged unchanged.

- B-T11 review: a new same-stack inspection request takes visual precedence over an old passed check, so both 302 and 602 are amber at A9 step 11. The fixture simulator also exposes the remaining A6 signature for later work; its answers are labelled simulated, not physical model results.

- B-T11: Fixture images are monochrome SVG illustrations, clearly labelled as demo illustrations rather than real photos. They support the whole-view, crop and annotation interactions without making claims about private photos. Confirming a label records the human marker without changing odds; changing its surface or zone reruns the adapter. Mock corrections choose a predefined weaker-evidence state, never calculate probabilities in the UI.
- B-T11: The feed groups by `eventKey`, retains attached photos, and shows the latest observation per incident. Its header opens a small evidence ledger; the fuller timeline remains the later B-T25 task.

- B-T10: Sender assignment follows source-message IDs from the locally parsed chat. Cached demo observations additionally use stable `msg-S07` style IDs. Assignment does not change unrelated incidents or discard their existing flat mapping.

- B-T09: A's browser preprocessing entry point currently exports no helpers. The local mock follows parse → pseudonymise → stripExif mock → qualityCheck mock → cached read. Pass-through photos never reach a live endpoint: the import is blocked unless the API mock flag is true. Demo results explicitly state they are not interpretations of uploaded evidence. The live path needs A's privacy helpers before enabling it.

- B-T07: The neighbour preview is a small, explicitly labelled mock preview until the full phone flow is built. Its button advances one hero-story step; it never claims that a real neighbour answered. WhatsApp opens a draft only. Drawers trap keyboard focus, close with Escape, and restore focus.

- B-T05: The building diagram is an accessible SVG derived from floor count, flat positions, wet areas, external walls and stacks. Flat buttons filter the feed. Source arrows follow the leading engine hypothesis and ceiling complaint; only posterior changes retrigger their 300ms motion. Reduced-motion preferences suppress drawing animation.
- Verification limitation: the computer-use preview repeatedly timed out attaching or connecting to localhost. Responsive CSS and interaction tests are checked, but a visual browser pass at 1440px / 390px remains unverified in this environment.

- B-T04: Desktop columns use 22:48:30 fractional widths after gutters. At 800px and below they stack, and detail tabs become native accordions. The single mock scenario is Happy path; the UK option remains disabled until the region-building task. Judge Mode exposes manual story advancement so all mock states are reviewable.

- B-T03: State 00 is the empty case; states 01–11 correspond exactly to A9 steps 1–11. Mock probabilities are illustrative fixtures, never field accuracy. All fixture observations are simulated. The mock API returns the labelled cached hero result, independent of uploaded content. Its WhatsApp URL contains no real recipient.
- B-T03: Mock flags are enabled only in ignored `.env.local`, as specified by the plan. Adapters switch to real implementations when both flags are false. No environment file is committed.

- B-T02: On Windows, the starter Turbopack CSS worker exits before connecting, including outside restricted execution and with both available Node runtimes. App dev/build use Next's webpack option and the existing Tailwind loader as a pre-loader. This preserves the Tailwind theme and needs no dependency or root-config change.

- B-T02: The starter Vitest config is renamed to `.mts` so Vite 7 is loaded as an ES module on Node 20. No root configuration changes.

- B-T02: Inter is loaded by the browser with a sans-serif fallback, so building the app does not require a font download. Status chips always include text. The styleguide deliberately displays all four status tokens together for review; case views use at most three colours plus grey.
- B-T02: `statusOf` maps documented observations and engine outputs to presentation only. It does not change the engine's safety, probabilities, check selection or trade.

- B-T24: The UK fixture uses the actual flat IDs in A's UK building (1–8), rather than inventing Flat 12. Switching regions retains each local case. The initial UK example is labelled Demo data and replayed by the engine; real UK imports use that building ID. Responsibility links and timestamp trail come from its Job Sheet.
