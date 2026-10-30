# App decisions

- B-T03: State 00 is the empty case; states 01–11 correspond exactly to A9 steps 1–11. Mock probabilities are illustrative fixtures, never field accuracy. All fixture observations are simulated. The mock API returns the labelled cached hero result, independent of uploaded content. Its WhatsApp URL contains no real recipient.
- B-T03: Mock flags are enabled only in ignored `.env.local`, as specified by the plan. Adapters switch to real implementations when both flags are false. No environment file is committed.

- B-T02: On Windows, the starter Turbopack CSS worker exits before connecting, including outside restricted execution and with both available Node runtimes. App dev/build use Next's webpack option and the existing Tailwind loader as a pre-loader. This preserves the Tailwind theme and needs no dependency or root-config change.

- B-T02: The starter Vitest config is renamed to `.mts` so Vite 7 is loaded as an ES module on Node 20. No root configuration changes.

- B-T02: Inter is loaded by the browser with a sans-serif fallback, so building the app does not require a font download. Status chips always include text. The styleguide deliberately displays all four status tokens together for review; case views use at most three colours plus grey.
- B-T02: `statusOf` maps documented observations and engine outputs to presentation only. It does not change the engine's safety, probabilities, check selection or trade.
