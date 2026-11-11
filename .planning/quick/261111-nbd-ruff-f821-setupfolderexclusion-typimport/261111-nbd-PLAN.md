---
id: 261111-nbd
title: Repair the StorageRoot exclusion annotation import
status: planned
job_id: 261111-98c5
phase_dir: .planning/phases/44-za-setup-assistant-folder-exclusions-and-platform-search
created: 2026-11-11
---

# Repair the StorageRoot exclusion annotation import

## Finding

`StorageRoot.setup_exclusions` annotates `SetupFolderExclusion`, but
`backend/models/storage.py` only imports `Platform` under `TYPE_CHECKING`.
Ruff consequently reports `F821`. The exclusion model itself is already
registered through `backend/models/__init__.py`.

## Plan

1. Add `from models.setup_folder_exclusion import SetupFolderExclusion` to the
   existing `TYPE_CHECKING` block in `backend/models/storage.py`, next to the
   analogous `Platform` import. Do not change model behavior, relationships,
   migrations, or scan handling.
2. Confirm `models/__init__.py` continues to import and export
   `SetupFolderExclusion`, so the normal SQLAlchemy metadata registration path
   remains intact. Keep `storage.py` at or below 450 lines.
3. Run only the affected Trunk static check and focused, non-test registration
   inspection. Do not create or run test suites, builds, browser checks, or
   Docker commands. Record the result in `SUMMARY.md`, update the quick-task
   entry in `STATE.md`, and commit the fix plus its GSD artifacts.

## Verification

- `trunk check backend/models/storage.py backend/models/setup_folder_exclusion.py backend/models/__init__.py`
  reports no `F821` finding for `SetupFolderExclusion`.
- A focused Python import/metadata inspection confirms `SetupFolderExclusion`
  remains reachable from `models` and registered in `Base.metadata.tables`.
- `wc -l backend/models/storage.py` is no greater than 450.
- `git diff --check` is clean.

## Release note

The requested stable `v0.1.0` is approval-gated. Do not tag, publish, push,
merge, or create a release during this quick task. Add this only to an existing
release-note location if one is already maintained by the active Phase 44
release handoff; otherwise leave release documentation unchanged.
