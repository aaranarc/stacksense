# Upload verification — 31 October 2026

A-T23 real-photo preview acceptance remains pending. This is a cloud API diagnostic, not a completed mobile end-to-end test.

Using the production build locally on port 3127, real Supabase storage/database, the configured Gemini provider, an isolated simulated hero case, and the explicitly synthetic `eval/data/placeholder/clean.jpg`:

| Step | Result |
| --- | --- |
| POST /api/link for duct_photo@302 | 200 |
| GET /c/token | 404: B's mobile route is not in the current pushed branch |
| GET /api/link/verify | 200 |
| POST /api/upload | 200, ReadResult mode live, one photo label |
| Returned observation checkId | duct_photo@302 |
| Repeat upload with the same token | 410 |
| Cleanup | Test case and private test image removed |

The test used synthetic-case consent/safety answers; it was not a resident safety assessment. No token, cookie, key, or photo bytes are saved here. The real demo photo path has been requested. GitHub deployment metadata currently contains no preview deployments. Required remaining acceptance: B's `/c/[token]` page, an actual team photo, and a deployed preview; open at 390×844, complete consent and all four safety questions, upload the photo, and verify the check-bound ReadResult and visible success state. Never substitute a generated image for the required real photo.
