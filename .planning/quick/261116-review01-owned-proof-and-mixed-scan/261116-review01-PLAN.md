---
quick_id: 261116-review01
title: Fix owned-proof budget and mixed archive continuation
wave: 1
depends_on: []
status: active
---

# Quick plan

1. Pass direct owned publication's known byte size into the existing bounded
   proof scope, retaining the 900-second cap and every integrity check.
2. Preserve archive failures from mapped scans while continuing selected legacy
   platforms, then fail the enclosing operation after both groups finish.
3. Inspect the existing running Scan browser flow after the correction. Do not
   create or run tests.
