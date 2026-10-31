# Authored demo imagery

The only real photograph is `duct_302.jpg`, supplied by the team. Its demo flat identifier is not a verified address. All other images are original vector schematics rendered to JPEG at quality 85, visibly headed **DEMO ILLUSTRATION**, with matching SVG source. No stock/unverified photographic reference is used.

| Image | Uses |
| --- | --- |
| duct_302.jpg | Hero duct reference and duct upload cache |
| ceiling_402.demo.jpg | Hero ceiling; happy scenario preview |
| window_202.demo.jpg | Hero window; rain scenario preview |
| trap_502.demo.jpg | Hero trap/grout; trap upload cache |
| meter_start_502.jpg | Hero meter reference and start-image cache |
| meter_end_502.jpg | Hero meter reference and end-image cache |
| day14_402.jpg | Hero Day-14 appearance reference |

Every illustration is simulated, not field evidence. Meter values are invented demo values; the drawing cannot establish a real timed reading. Day-14 appearance does not establish dryness. `assets.json` maps IDs to paths; regenerated hero/scenario JSON includes `demoAssets` display metadata without changing the scripted observations or probabilities. The uncertainty/electrical/locked/dark/lateral/Break-it previews under ../scenarios/ are also authored illustrations.

All JPEGs have maximum edge ≤1600 and no EXIF/GPS, XMP, IPTC or ICC. Raw inputs remain ignored and untracked. Removed stock files are deleted from the current tracked tree; normal git rm does not erase blobs in historical commits. No history rewrite or force push was performed.

`generate-demo-illustrations.ts` never auto-imports raw/reference photos: only duct is retained as team-photo. Cache regeneration prunes bundled entries to current manifest/read/upload keys, and removed cache keys are purged from Supabase. Do not put historical reference photos back into active fixtures or caches.
