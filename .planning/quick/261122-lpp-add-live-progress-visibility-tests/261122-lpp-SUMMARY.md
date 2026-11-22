---
quick_id: 261122-lpp
title: Add direct live-progress visibility contracts
status: complete
completed: 2026-11-22
---

# Outcome

Extended the existing `useScanView` harness with controlled operation and
socket-row state. The direct contracts cover the accepted scan before its first
platform row, preserved completed rows, and the terminal empty state.

## Verification

- `npm run test -- src/v2/views/ScanCollection.test.ts` (9 passed)
- `trunk check frontend/src/v2/views/ScanCollection.test.ts`
