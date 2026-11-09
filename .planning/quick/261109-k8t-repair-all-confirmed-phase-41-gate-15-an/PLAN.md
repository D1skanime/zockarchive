---
quick_id: 261109-k8t
phase: 41
status: in_progress
---

# Repair confirmed Phase 41 Gate 15 and Gate 16 MariaDB regressions

## Scope

- Deduplicate all Gate 15 MariaDB failures and compare the confirmed Gate 16
  shards instead of relying on the final log fragment.
- Correct the scoped collection path used by `record_checked_game()` while
  preserving promotion atomicity, retry behavior, and the operation scope fence.
- Update stale tests to patch their current focused-module owners and request
  bounded result pages explicitly. Do not add tests before renewed live UAT.

## Steps

1. Inventory all failure families from the gate receipts and classify them as
   product behavior, stale mock ownership, or stale bounded-snapshot contract.
2. Repair the canonical checked-game path and affected lifecycle/result tests.
3. Repair focused-module mock seams across the remaining affected test groups,
   run the relevant MariaDB shards or test files, and record the evidence.
