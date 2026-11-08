---
quick_id: 261108-rso
status: in-progress
phase: 41
wave: 1
depends_on: []
files:
  - backend/handler/scan_operation_projection.py
  - backend/handler/scan_inventory_status.py
  - .planning/quick/261108-rso-fix-false-positive-scan-action-required-/261108-rso-SUMMARY.md
---

# Fix false positive scan action-required results

## Task 1: Align explicit Windows-identification semantics

Replace the JSON boolean predicate that treats a missing `identified_windows`
field as false on MariaDB/MySQL with an explicit JSON text comparison. Reuse
the same predicate for result classification, action-required filtering,
samples, totals, and inventory unresolved counts so only an explicit `false`
is unidentified. Preserve warnings, failures, and skipped outcomes.

## Task 2: Verify the repaired stored scan

Build/typecheck and run only the already-created accepted-behavior tests that
remain in the worktree. Do not add test cases during the reopened live-UAT
window. Inspect the existing saved scan in the browser on desktop and mobile:
the action-required view must be empty for its 25 skipped console rows and
the skipped outcome filter must retain them.
