---
quick_id: 261109-ihy
status: complete
phase: 41
---

# Direct regression coverage for the approved scan overview

## Delivered

- Added direct composable coverage that rejects a late result page after a
  newer platform selection has completed.
- Added MariaDB-backed result-projection coverage for missing, null, true, and
  explicitly false Windows-inventory facts. Only the explicit false and a
  warning enter the action-required result set.
- Updated affected Scan-operation tests to obtain stored item identities from
  persistence instead of relying on intentionally row-free lifecycle
  snapshots, and to patch the current split-module owners.

## Verification

- `npm run test -- src/v2/composables/useScanOperationResults/index.test.ts src/v2/data/adapters/scanOperations.test.ts` passed, 2 files and 50 tests.
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 900 tests/handler/test_scan_operations.py tests/endpoints/test_scan_operations.py` passed, 57 tests. The disposable target cleanup and source-immutability checks passed.

## Scope

- Only test files and GSD planning artifacts changed. No product code changed
  after the human UAT approval.

## Commit

- `e0787c21d test(phase-41): Scan-Ergebnisabläufe absichern`
