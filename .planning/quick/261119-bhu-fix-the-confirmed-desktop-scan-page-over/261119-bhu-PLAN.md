---
quick_id: 261119-bhu
title: Keep Scan actions clear of quick-scan copy
status: in_progress
---

# Plan

1. Keep Scan controls in the same sticky card as the scan-type description so
   the document-flow action footer cannot move beneath sticky content.
2. Inspect the completed-scan page while scrolling at desktop width and the
   narrow mobile layout, exercising the Scan and Library Management actions.
3. Record the result, update project state, inspect the intended diff, and
   commit without starting a test suite.

# Acceptance criteria

- The quick-scan description remains readable while the desktop page scrolls.
- Scan and Library Management actions remain operable and do not overlay copy.
- Narrow layouts retain normal document flow.
