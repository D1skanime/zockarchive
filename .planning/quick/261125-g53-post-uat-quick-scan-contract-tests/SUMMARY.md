---
id: 261125-g53-post-uat-quick-scan-contract-tests
status: complete
scope: test-and-planning-only
product_head: 936778cc0
test_commit: dfafc93e7
---

# Post-UAT quick-scan contract tests summary

Direct regression tests now preserve the accepted shared-download scan
authorization contract without changing production behavior.

## Coverage

- `shared_download_scan_allowed` accepts PS3 and Windows during `ScanType.QUICK`,
  rejects additional platforms during QUICK, accepts them for COMPLETE, and
  rejects metadata-only or active Windows quick contexts.
- Tuple-context reconciliation reaches the existing path for PS3 and eligible
  Windows sources, while a QUICK additional-platform source never starts
  reconciliation.
- The two Steam scan-handler mocks expect the exact
  `(metadata_only, windows_quick_context, scan_type)` tuple instead of the
  retired boolean contract.

## Verification

```text
uv run python backend/tools/phase34.py backend --dialect mariadb --timeout 300 \
  tests/handler/test_scan_folder_download.py tests/handler/test_scan_handler.py -q
Result: 61 passed, 2 existing SQLAlchemy relationship warnings, 13.67s
```

Only the requested targeted MariaDB run was executed. No full suite, browser
test, snapshot test, click test, product code, fixture outside tests, or
configuration changed. Documentation needs no update because architecture and
runtime behavior are unchanged.

## Files changed

- `backend/tests/handler/test_scan_folder_download.py`
- `backend/tests/handler/test_scan_handler.py`
- `.planning/quick/261125-g53-post-uat-quick-scan-contract-tests/PLAN.md`
- `.planning/quick/261125-g53-post-uat-quick-scan-contract-tests/SUMMARY.md`
- `.planning/STATE.md`

## Deviations from plan

None.

## Self-check: PASSED

The test commit, plan, summary, state entry, and focused MariaDB result are
present.
