---
quick_id: 261114-ppl
status: in_progress
---

# Extract direct mapping readiness

## Objective

Remove the Home.vue line-count regression without changing the corrected
direct-folder readiness behavior. One small shared data helper owns the
completed-setup assignment filter used by Home and Scan.

## Steps

1. Extract active direct-platform id resolution and storage readiness lookup
   into a focused v2 data helper.
2. Replace duplicated Home and Scan implementation with the helper so Home
   returns to its prior line count or smaller.
3. Run typecheck and the reported line-count check only, update quick
   artifacts and state, then commit. Do not add or run tests.
