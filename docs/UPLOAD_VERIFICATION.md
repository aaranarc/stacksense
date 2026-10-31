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

The test used synthetic-case consent/safety answers; it was not a resident safety assessment. No token, cookie, key, or photo bytes are saved here. A real demo photo has now been supplied; see the update below. GitHub deployment metadata currently contains no preview deployments. Required remaining acceptance: B's `/c/[token]` page, an actual team photo, and a deployed preview; open at 390×844, complete consent and all four safety questions, upload the photo, and verify the check-bound ReadResult and visible success state. Never substitute a generated image for the required real photo.

## Real team photo verification

The user supplied a real raw team photo in ignored `eval/data/photos/duct_302_raw.jpg`. It was re-encoded at JPEG quality 85 to `fixtures-ai/photos/demo/duct_302.jpg`, dimensions 1200×1600. Sharp metadata inspection verified EXIF, XMP, IPTC and ICC are absent; GPS carried in EXIF is therefore absent. The raw file is ignored and untracked. Only the clean copy is authorized for the repository and upload.

Repeating the cloud API sequence with this clean photo returned link 200, verify 200, upload 200 with `mode: live`, one photo label and observation `checkId: duct_photo@302`; token reuse returned 410. The isolated test case and storage object were removed after verification. This exercises the real database, private storage and Gemini reader. `/c/token` remains 404 on the current a/core build, so browser consent/camera/success screens and deployed mobile-preview acceptance remain pending B's page and a preview deployment.
