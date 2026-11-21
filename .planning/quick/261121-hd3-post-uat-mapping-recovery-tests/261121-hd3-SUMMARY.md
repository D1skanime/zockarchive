---
quick_id: 261121-hd3
title: Add accepted mapping recovery logic tests
status: complete
created: 2026-11-21
completed: 2026-11-21
---

# Result

## Added direct coverage

- Exact missing Windows mapping identities rebind to the active logical path and
  rebuild inventory through the existing scanner path.
- Non-matching inactive mappings are rejected without updating the catalog row.
- The existing selected-child fallback remains available when identity recovery
  cannot prove a mapping transition.
- A restart-orphaned RQ `STARTED` record may recover only when no live worker
  owns it. A live owner keeps the operation fenced.

## Verification

The disposable MariaDB target ran only
`test_scan_mapping_identity_recovery.py` and
`test_scan_operation_recovery.py`: 11 passed, 0 failures, 0 errors, 0 skips.
Scoped Trunk Ruff and mypy checks passed for the changed test files.

## Scope

Only test and GSD planning files changed. No product code, production data,
NAS content, release, merge, or deployment action occurred.
