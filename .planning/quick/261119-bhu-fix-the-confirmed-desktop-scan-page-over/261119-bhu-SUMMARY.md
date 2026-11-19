---
quick_id: 261119-bhu
title: Keep Scan actions clear of quick-scan copy
status: complete
---

# Summary

## Implementation

`ScanCardFooter` is now part of the sticky Scan configuration card. Its actions
therefore remain after the scan-type copy inside the same layout container rather
than occupying document flow beneath a separately sticky card.

## Browser verification

- Desktop, 1310 px: scrolled Scan card kept the complete quick-scan description
  above both actions. The Library Management action navigated successfully.
- Mobile, 390 px: the description, both actions, and live-progress panel remained
  in normal vertical flow without overlap. The Library Management action navigated
  successfully.
- Screenshots: `scan-layout-desktop-261119.png` and
  `scan-layout-mobile-261119.png` in the job screen directory.
- The anonymous bootstrap `/api/users/me` 401 occurred before form login as
  expected. No post-login request failures were recorded.

No test suite was started.
