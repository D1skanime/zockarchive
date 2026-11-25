---
id: 261125-scan-handler-shared-download-authorization
status: complete
scope: backend-and-planning
---

# Shared-download scan authorization extraction summary

The folder-download lifecycle now owns the complete scan authorization decision
while `scan_handler.py` remains at the main baseline of 1,722 lines.

## Cause and correction

The restored PC/PS3 quick-scan exception added two net lines to the legacy scan
orchestrator. Its policy belongs with shared-download reconciliation, alongside
the existing platform eligibility gate. The reconciler now receives the current
scan context and authorizes it with one focused helper before evaluating source
eligibility.

The policy is unchanged: metadata-only scans and Windows quick contexts are
rejected, PC and PS3 remain eligible during `ScanType.QUICK`, and additional
platforms require a non-quick scan before the existing size eligibility check.
The existing boolean reconciliation argument remains supported for its direct
callers; the scan handler alone supplies the richer context.

## Verification

```text
scan_handler.py: 1722 lines (main: 1722)
trunk check backend/handler/scan_handler.py backend/handler/scan_folder_download.py
Result: Checked 2 files, no new issues (1 existing issue)
```

No tests or test suites ran, as required before live acceptance.

## Files changed

- `backend/handler/scan_folder_download.py`
- `backend/handler/scan_handler.py`
- `.planning/quick/261125-scan-handler-shared-download-authorization/SUMMARY.md`
- `.planning/STATE.md`

## Deviations from plan

None. The existing reconciliation entry point accepts the already available scan
context, avoiding a second handler import boundary.

## Self-check: PASSED

The plan, summary, state entry, focused helper, required line count, and
targeted Trunk check are present.
