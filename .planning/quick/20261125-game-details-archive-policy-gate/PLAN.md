---
id: 20261125-game-details-archive-policy-gate
status: complete
scope: gate06-frontend-test-correction
---

# Quick Plan

Move the archive-policy source assertion from the extracted view location to
the responsible shared download-details composable, retaining the view wiring
and request-before-ready ordering checks.
