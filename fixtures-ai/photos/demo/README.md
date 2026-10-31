# Team demo photographs

`duct_302.jpg` is the user's authorized real team photograph, not a generated image or a ground-truth defect label. Prepared on 31 October 2026 from an ignored raw photo using `packages/ai/scripts/prepare-demo-photo.ts`:

- JPEG, quality 85, 1200×1600; maximum edge 1600.
- Sharp inspection: no EXIF (including GPS), XMP, IPTC or ICC.
- No raw image is tracked. Never commit `eval/data/photos/*_raw.jpg`.

The photograph's demo identifier is not a verified property address. Its visual labels are model outputs, not a moisture measurement or proof of a hidden source. Add a real trap photograph only after the user supplies it, using the same cleaning/metadata checks.

## Other demo inputs

Meter start/end, trap detail and Day-14 appearance are schematic illustrations when no corresponding raw team photo is supplied. Each generated JPEG has a visible DEMO ILLUSTRATION banner and matching `.demo.svg` source; cache warnings repeat the simulated provenance. The meter registers are invented demo values, not observed readings; the Day-14 drawing is not a real follow-up or evidence of dryness. Scenario schematics are in `../scenarios/` with the same labels. `demo-manifest.json` identifies the real-photo slots separately. These assets never enter the human-labelled evaluation dataset.
