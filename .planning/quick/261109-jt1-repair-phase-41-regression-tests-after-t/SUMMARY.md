---
quick_id: 261109-jt1
phase: 41
status: complete
---

# Repair Phase 41 regression tests after bounded snapshots

## Delivered

- Moved the inventory-count test seams to the focused socket modules that own
  filesystem access and scan execution.
- Kept the row-free operation snapshot contract explicit while checking
  provider diagnostics through their durable SQL records.
- Added the missing concrete type for the classification test matrix.

## Verification

- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 900 tests/endpoints/sockets/test_scan_inventory_count.py tests/handler/test_scan_metadata_result.py tests/handler/test_scan_operations.py`
  - 39 passed, 2 warnings.
- `trunk check backend/tests/endpoints/sockets/test_scan_inventory_count.py backend/tests/handler/test_scan_metadata_result.py backend/tests/handler/test_scan_operations.py`
  - passed.

## Scope

- Test and planning artifacts only; product code remains unchanged.
- Commit: `0009f6d45` (`test: Scan-Regressionstests aktualisieren`).
