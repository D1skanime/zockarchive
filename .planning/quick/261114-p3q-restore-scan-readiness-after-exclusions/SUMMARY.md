---
quick_id: 261114-p3q
status: complete
---

# Restore scan readiness after exclusions

## Cause and implementation

Platform id 7 is Wii. Its deliberate `Nicht scannen` disposition leaves no
active storage mapping, so the legacy per-platform endpoint correctly returns
`409 platform_mapping_missing`. Scan readiness treated that expected absence as
an infrastructure error and displayed the blocked storage card.

Scan now derives the platform ids to validate from the completed-setup direct
folder projection, including only active mapped dispositions. Excluded folders
are therefore not queried as missing mappings. The storage client also treats
that documented conflict as an absent mapping for legacy callers. The Scan
page has one Library Management action, which opens `?tab=direct`.

## Verification

- `npm run typecheck` completed successfully.
- Authenticated desktop browser: pc remained Windows, Wii remained excluded,
  the Scan button was enabled without Retry or the storage warning, and two
  consecutive quick scans completed. The button was still enabled after
  reload.
- The sole Library Management link opened the Games tab with direct folders.
  The same link, active tab, dispositions, and enabled Scan action were
  inspected at 390 px.
- Browser evidence is recorded in the external job sight-check report. No new
  tests or test suites were added or run for this pre-UAT correction.
