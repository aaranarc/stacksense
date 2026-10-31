# Photographic demo references

All active JPEGs are re-encoded at quality 85, maximum edge 1600, with EXIF/GPS, XMP, IPTC and ICC absent. Raw files remain ignored under eval/data/photos/ and are never committed. Visible source watermarks are preserved.

| Asset | Source / limitation |
| --- | --- |
| duct_302.jpg | Previously supplied team duct photograph; demo flat ID is not a verified address |
| ceiling_402.jpg | User-supplied photographic ceiling reference; capture/location unverified |
| window_202.jpg | User-supplied stock window/mould reference; Shutterstock watermark retained |
| trap_502.jpg | User-supplied drain/trap reference; does not establish cracked tile grout |
| meter_502_a.jpg | User-supplied meter reference; only one register image, not a timed pair |
| meter_end_502.jpg | DEMO ILLUSTRATION; no matching second meter photograph exists |
| day14_402.jpg | DEMO ILLUSTRATION; no actual post-repair Day-14 recapture supplied |

The three clean-room WhatsApp images do not establish a post-repair recapture, so they are not substituted for Day-14 evidence. The photograph content need not match every scripted hero label: for example the window reference shows mould, while the simulated hero includes efflorescence. Neither the reference nor its model label validates the scenario's scripted cause, date, reading or finding.

`assets.json` maps hero photo IDs and scenario previews to these clean assets, with provenance labels. Generated hero/scenario JSON includes a `demoAssets` extension for display metadata; shared EngineState schemas, observations and posterior calculations remain unchanged. Consumers may resolve metadata through assets.json without treating it as observed evidence. B's UI files are not edited by this asset task.

Happy/uncertainty previews use the ceiling photograph, and the rain preview uses the window reference. Electrical, locked-access, dark-photo, lateral-travel and Break-it previews remain visibly labelled schematics under ../scenarios/. Obsolete replaced schematic files were removed. Cached reference-photo outputs carry DEMO warnings; no image here becomes human-labelled evaluation data or a real measured reading automatically.
