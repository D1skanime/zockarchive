---
quick_id: 261109-ihy
title: Add direct regression tests for the live-UAT-approved scan overview
status: planned
phase: 41
---

# Quick Task 261109-ihy: Direct regression coverage for the approved scan overview

## Test Classification

- **TDD:** `useScanOperationResults` has request-sequencing behavior that can be
  checked directly through its public functions and refs.
- **TDD:** the scan-operation projection has SQL-backed classification behavior
  for explicit `identified_windows` facts that can be checked through the
  handler and its result query.
- **Skip:** `Scan.css` is responsive styling. It remains covered by the
  completed browser UAT and is not suitable for a click, snapshot, or pixel
  test.
- **Skip:** browser E2E tests are intentionally excluded. The approved scope
  requests direct hook, handler, and endpoint logic tests only.

## Tasks

1. Add a composable regression test proving a stale result page cannot replace
   the latest selected platform page.
2. Add a database-handler regression test proving only an explicit JSON false
   enters the action-required result set, while true, null, and absent facts
   remain skipped.
3. Run the two modified test files and their directly affected frontend/backend
   test groups. Do not change production code.

## Acceptance Criteria

- The tests call public composable functions or handler/query logic directly.
- No click simulation or render snapshot is added.
- Only test and `.planning` files change.
