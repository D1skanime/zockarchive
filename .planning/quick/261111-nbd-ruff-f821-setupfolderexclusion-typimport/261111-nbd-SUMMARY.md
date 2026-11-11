---
id: 261111-nbd
title: Repair the StorageRoot exclusion annotation import
status: complete
job_id: 261111-98c5
phase_dir: .planning/phases/44-za-setup-assistant-folder-exclusions-and-platform-search
completed: 2026-11-11
---

# Repair the StorageRoot exclusion annotation import Summary

`StorageRoot.setup_exclusions` now has its type-only `SetupFolderExclusion`
import, while runtime model registration remains owned by `models.__init__`.

## Implementation

- Added `SetupFolderExclusion` beside the existing type-only `Platform` import.
- Confirmed `models.__init__` still imports and exports the exclusion model.
- Kept `backend/models/storage.py` at 450 lines.

## Verification

- `trunk check backend/models/storage.py backend/models/setup_folder_exclusion.py backend/models/__init__.py` passed, with no issues.
- Source inspection confirmed `SetupFolderExclusion` remains imported and exported by `models.__init__`.
- `wc -l backend/models/storage.py` reported `450`.
- `git diff --check` passed.

No test suite, build, browser, Docker, release, merge, push, tag, or publication
was run. The requested stable `v0.1.0` remains approval-gated.

## Deviations from Plan

None. The line limit required removing one redundant separator while adding the
type-only import.

## Self-Check: PASSED

- `backend/models/storage.py` contains the `TYPE_CHECKING` import.
- `backend/models/__init__.py` retains the runtime registration import and export.
