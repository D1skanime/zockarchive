---
quick_id: 261122-lpp
title: Add direct live-progress visibility contracts
status: in_progress
---

# Plan

1. Extend the existing `useScanView` composable test harness with controllable
   operation and socket-row state.
2. Add direct contracts for immediate empty progress, retained completed rows,
   and the terminal empty state without click simulation or snapshots.
3. Run only the new directly affected frontend test file and record the result
   in the Quick summary and STATE before committing.
