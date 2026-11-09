---
quick_id: 261109-fm3
status: complete
phase: 41
---

# Keep the mobile Scan action clear of the bottom navigation

## Delivered

- Compacted only the extra-small Scan layout so the primary Scan action has a
  complete touch target above the fixed bottom navigation.
- Kept the desktop layout and scan behavior unchanged.

## Verification

- Inspected the signed-in `/scan` page with Playwright at 1440 px and 390 px.
- Opened and dismissed the Scan information dialog, opened and dismissed all
  four Scan selectors, and followed the Library management link on both
  viewports without starting a scan.
- The Scan action was fully clear of the mobile navigation on the final
  390 px screenshot. No scan API request failed.
- The app still logs a separate HTTP 404 from its GitHub release-version
  lookup. It is unrelated to `/scan` and no Scan request failed.
- No test suite was run, as required by the pre-review UAT instruction.

## Commit

- `805bcc387 fix: mobilen Scan-Start freihalten`
