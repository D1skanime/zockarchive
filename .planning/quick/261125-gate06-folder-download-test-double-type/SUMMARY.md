---
id: 261125-gate06-folder-download-test-double-type
status: complete
scope: test-and-planning-only
product_head: 925fe00e8
---

# Gate06 folder-download test-double type summary

The folder-download eligibility test now expresses its deliberately minimal
runtime double as a `Rom` only at the typed helper boundary.

## Cause and correction

Trunk/mypy reported `arg-type` because the threshold parametrization passes a
`SimpleNamespace` directly to `_is_shared_download_inventory_eligible`, whose
contract is `Rom`. The runtime double already contains the only attributes
read by the helper, `fs_size_bytes` and `has_simple_single_file`.

The call now uses `cast(Rom, rom)`, matching the existing direct-helper
convention in this file. The cast is limited to the test boundary. No product
fallback, assertion, skip, fixture, or threshold case changed.

## Verification

```text
trunk check backend/tests/handler/test_scan_folder_download.py
Result: Checked 1 file, no issues
```

No test suite ran. The focused static check does not execute pytest or start a
database environment.

## Files changed

- `backend/tests/handler/test_scan_folder_download.py`
- `.planning/quick/261125-gate06-folder-download-test-double-type/PLAN.md`
- `.planning/quick/261125-gate06-folder-download-test-double-type/SUMMARY.md`
- `.planning/STATE.md`

## Deviations from plan

None. The existing minimal-double convention applied directly.

## Self-check: PASSED

The plan, summary, state entry, and typed test boundary are present. The
focused Trunk check passed.
