---
id: 261125-g53-post-uat-quick-scan-contract-tests
title: Direct regression contracts for accepted shared-download quick scans
status: planned
scope: test-and-planning-only
product_head: 936778cc0
---

# Quick Plan

Add only direct, post-UAT regression tests for the shared-download scan
authorization contract. This task does not change runtime code, download
transport, browser UI, database fixtures, or any accepted visibility behavior.

1. Extend `backend/tests/handler/test_scan_folder_download.py` with direct
   `shared_download_scan_allowed` cases. Use the real `ScanType` values at the
   helper boundary and assert all branches: PS3 and Windows remain authorized
   during `ScanType.QUICK`; an additional platform is denied during QUICK and
   authorized for a non-QUICK scan; `metadata_only` and an active Windows quick
   context deny every platform. Keep these pure-function tests independent of
   clicks, rendering, snapshots, filesystem enumeration, or persisted data.

2. In the same test module, invoke
   `reconcile_scanned_shared_download_inventory` with its tuple scan context
   and an `AsyncMock` reconciliation collaborator. Prove that authorized PS3
   and eligible Windows ROMs reach the existing reconciliation path, while a
   QUICK additional-platform tuple does not reach it. Use complete
   `SimpleNamespace` doubles and cast only at the typed `Rom` boundary. Do not
   add a permissive `getattr`, alter production eligibility, or weaken any
   assertion.

3. Inspect the existing mocked `scan_rom` call assertions in
   `backend/tests/handler/test_scan_handler.py`. If they still assert the
   pre-extraction boolean third argument, update only those directly affected
   expectations to the exact `(metadata_only, windows_quick_context,
   scan_type)` tuple forwarded by `scan_handler.py`; retain the current test
   fixtures and all non-download assertions. Add one focused QUICK forwarding
   assertion only if no existing affected scan test proves the tuple hand-off.

4. Run only the directly affected files through the existing disposable
   MariaDB runner:

   `uv run python backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_scan_folder_download.py tests/handler/test_scan_handler.py -q`

   If a failure is solely a seconds-scale deadline/timeout ordering issue,
   rerun that one file once and record it as VM load. Do not run a full backend
   suite, a frontend suite, click/mouse test, or browser harness.

5. Create `SUMMARY.md` with the exact cases and runner result, update the
   Quick Tasks entry in `.planning/STATE.md`, inspect the final diff and commit
   only `backend/tests/handler/test_scan_folder_download.py`, optionally the
   directly affected `backend/tests/handler/test_scan_handler.py`, and this
   task's `.planning` artifacts. State that documentation needs no update
   because production behavior and architecture remain unchanged.

## Acceptance criteria

- Direct tests protect legacy PC/PS3 QUICK authorization, additional-platform
  QUICK rejection, non-QUICK admission, and both metadata-only and Windows
  quick-context rejection.
- Tuple-context reconciliation reaches the existing PC/PS3 path only when
  authorized and eligible, and cannot start inventory work for the rejected
  additional-platform QUICK path.
- Any affected scan-handler mock expectation matches the tuple contract, not
  the retired boolean contract.
- Only test files and `.planning` artifacts change, and the focused MariaDB
  command passes without a full-suite run.
