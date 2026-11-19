---
quick_id: 261119-bpn
title: Clarify the Scan type selector and remove technical copy
status: complete
completed: 2026-11-19
---

# Summary

- Removed the two technical quick-scan paragraphs below the scan-type selector
  without replacement copy.
- Wrapped the existing selector in a feature-scoped, visibly outlined control;
  its existing chevron, options, and model binding remain unchanged. Keyboard
  focus receives a clear two-pixel outline.
- An isolated current-branch Vite view was checked through the normal login form
  at 1440 px and 390 px. The selector opened with multiple options, its focus
  was visible, and scrolling left the Scan and Library Management actions clear
  of the Scan type section. Evidence is recorded in the job UAT report with
  `scan-type-desktop-261119.png` and `scan-type-mobile-261119.png`.

No test suite was added or run before live UAT.
