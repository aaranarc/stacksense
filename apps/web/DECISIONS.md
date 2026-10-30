# App decisions

- B-T02: On Windows, the starter Turbopack CSS worker exits before connecting, including outside restricted execution and with both available Node runtimes. App dev/build use Next's webpack option and the existing Tailwind loader as a pre-loader. This preserves the Tailwind theme and needs no dependency or root-config change.

- B-T02: The starter Vitest config is renamed to `.mts` so Vite 7 is loaded as an ES module on Node 20. No root configuration changes.

- B-T02: Inter is loaded by the browser with a sans-serif fallback, so building the app does not require a font download. Status chips always include text. The styleguide deliberately displays all four status tokens together for review; case views use at most three colours plus grey.
- B-T02: `statusOf` maps documented observations and engine outputs to presentation only. It does not change the engine's safety, probabilities, check selection or trade.
