# AI implementation decisions

## A-T12
- WhatsApp dates detect DMY/MDY from a component over 12; ambiguous exports default to DMY. Timestamps without a zone default to IST (+330 minutes); callers can supply dateOrder/offsetMinutes. Invalid dates are discarded.
- Parsed sender names stay local until pseudonymise returns S01… and a separate browser-only keyMap. Known sender names, titled full names, phone numbers and emails are redacted; applications must let people review text for other personal details before submission. Attachment IDs are filenames or synthetic omitted-media IDs, not uploads.
- Photo quality uses prototype pixel thresholds, never AI confidence. Canvas re-encoding discards EXIF; crops must be made from the cleaned image. Helpers perform no network calls.
