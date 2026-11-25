---
id: 261125-v8q
title: Gate shared inventory at the known ROM size
status: complete
date: 2026-11-25
job_id: 261125-6c73
commit: 3fecf0e84
---

# Quick Task 261125-v8q Summary

Shared-download reconciliation now rejects an unknown or sub-threshold stored
ROM size before it can enumerate source files, create manifest members, or
calculate SHA-256 hashes. The existing inclusive 4,000,000,000-byte rule now
lives in the neutral folder-download module and is reused by both scan and
response paths.

## Changes

- Added the known-size gate to the existing scan-side eligibility predicate.
  Windows still requires a simple single-file source, and all caller-provided
  authorization, metadata, quick-scan, persistence, and manifest safeguards
  remain unchanged.
- Moved the shared threshold out of the response projection so scan lifecycle
  and response capability consume one authoritative value.
- Documented that the authorized reconciler never starts folder inventory work
  for an unknown or smaller recorded ROM size, while read-only responses never
  inventory, hash, estimate, or materialize members.

## Verification

- Static call-path inspection confirms
  `reconcile_scanned_shared_download_inventory` evaluates
  `_is_shared_download_inventory_eligible` before it calls
  `reconcile_shared_download_inventory`, whose first expensive operation is
  `build_shared_download_component`.
- The predicate requires `rom.fs_size_bytes is not None` and an inclusive
  `>= SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES` comparison. The response capability
  imports the same constant and retains its inclusive lower-bound check.
- `trunk check backend/handler/filesystem/folder_download.py backend/handler/scan_folder_download.py backend/endpoints/responses/folder_download.py docs/BACKEND_ARCHITECTURE.md` passed with no issues.
- No test files changed and no tests or test suites were started, as required
  before Live-UAT.

## Dev Browser Evidence

Browser interaction was unavailable to this Linux execution agent. No existing
Dev browser session, Dev URL, or safely identified below-threshold and
at-or-above-threshold console records were provided to this agent. The existing
Windows IAB session remains outside this agent's access boundary, and no
harness, deployment, scan, database change, credential action, or source-data
operation was attempted.

Required human Dev UAT in the already authenticated Dev session:

1. Desktop viewport: open an existing console game with a known stored total of
   at least 4,000,000,000 bytes, open Game Download, and verify the existing
   shared dialog or queue action appears. Cancel before starting a transfer.
2. Desktop viewport: open an existing console game below 4,000,000,000 bytes,
   and verify its established ordinary direct-download action remains instead
   of the shared dialog.
3. Repeat both actions at a mobile viewport. Do not run a scan or alter data.

## Self-Check: PASSED

- Commit `3fecf0e84` contains the three intended backend files.
- This summary and its existing quick plan are stored in the assigned quick
  task directory.
