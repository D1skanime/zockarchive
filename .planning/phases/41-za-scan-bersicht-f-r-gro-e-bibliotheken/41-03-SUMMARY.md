---
phase: 41-za-scan-bersicht-f-r-gro-e-bibliotheken
plan: 03
subsystem: scan operation overview
tags: [scan, status, accessibility, bounded-results]
requires: [41-01]
provides: [compact-scan-operation-overview]
affects: [operation-status-panel, scan-result-disclosure]
tech_stack: [Vue 3, TypeScript, vue-i18n, ZA primitives]
key_files:
  created:
    - frontend/src/v2/components/Scan/ScanOperationOverview.vue
  modified:
    - frontend/src/v2/components/Scan/InventoryStatusSummary.vue
    - frontend/src/v2/components/Scan/OperationStatusPanel.vue
decisions:
  - Progress and active platform render only from current snapshot facts that pass local validity checks.
  - Inventory metrics remain distinct from the operation total and result rows are capped to three safe actionable samples.
metrics:
  tasks_completed: 2
  tests_run: 0
---

# Phase 41 Plan 03: Compact Scan Operation Overview Summary

The scan status anchor now composes a bounded snapshot-driven overview while retaining recovery controls in the panel.

## Implemented

- Added `ScanOperationOverview` for trustworthy determinate or indeterminate progress, the explicit active platform, compact terminal communication, operation total, inventory metrics, and a capped action-required sample.
- Reduced `InventoryStatusSummary` to aggregate Windows inventory facts. It no longer renders all item details or offers an accumulated load-more path.
- Kept `OperationStatusPanel` responsible for connection/recovery state, permission-aware controls, warning retry selection, focus restoration, and alert semantics. It forwards the action-required-details intent for the later disclosure owner.
- Referenced new overview translation keys without adding locale content. Plan 04 owns the all-locale scan vocabulary and will provide those keys.

## Verification

- Passed `git diff --check`.
- Ran `cd frontend && npm run typecheck`. The overview and status-panel changes have no TypeScript errors. The command remains blocked by three pre-existing, concurrently edited errors in `src/v2/data/adapters/scanOperations.test.ts` where calls still pass three arguments to the new two-argument adapter API.

## Tests

No tests were added, modified, or run. The pre-UAT test lock remains in effect.

## Deviations from Plan

None. The all-locale copy is intentionally deferred to the dependent Plan 04, which owns every `scan.json` file.

## Self-Check: PASSED

- Confirmed the new overview component and this summary exist.
- Confirmed the implementation commit records only Plan 41-03 files.
