---
phase: 41-za-scan-bersicht-f-r-gro-e-bibliotheken
plan: 02
subsystem: scan result transport
tags: [scan, pagination, url-state]
requires: [41-01]
provides: [summary-first-status, bounded-result-explorer]
affects: [scan-operation-api, scan-result-ui]
tech_stack: [Vue, Vue Router, Axios]
key_files:
  created:
    - frontend/src/v2/composables/useScanOperationResults/index.ts
  modified:
    - frontend/src/v2/data/adapters/scanOperations.ts
    - frontend/src/v2/composables/useScanOperationStatus/index.ts
decisions:
  - Lifecycle polling requests row-free operation snapshots only.
  - Detail queries always request one fixed 50-row server page.
metrics:
  tasks_completed: 2
  tests_run: 0
---

# Phase 41 Plan 02: Bounded Scan Result Transport Summary

Scan lifecycle reconciliation now remains row-free, while the dedicated explorer owns one URL-reproducible server page at a time.

## Implemented

- Added a validated scan status query boundary with summary-only snapshots and fixed 50-row detail pages.
- Removed result accumulation from lifecycle polling while preserving actor, version, attempt and socket reconciliation safeguards.
- Added a URL-backed result composable with debounced name search, immediate filters and pagination, stale-response rejection, retry support, and page replacement after successful matching responses.
- Closing the explorer clears rendered data; failed replacement requests retain the previous bounded page.

## Verification

- Passed `npm run typecheck` in `frontend`.
- Passed `git diff --check` before commit.

## Tests

No tests were added, changed, or run under the pre-UAT test lock.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Compatibility] Kept an explicitly rejecting positional overload for existing test source compilation.**
- **Issue:** Existing test source still references the removed offset/limit signature.
- **Fix:** The compatibility overload accepts the legacy shape at type level but rejects it at runtime, so only typed result queries can fetch details.
- **Files modified:** `frontend/src/v2/data/adapters/scanOperations.ts`
