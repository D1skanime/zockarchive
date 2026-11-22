---
phase: 47-za-game-download-ansicht-bereinigen-und-vorhandenen-pc-downl
plan: 01
status: complete
wave: 1
---

# Plan 47-01 Summary

## Outcome

Added a neutral, persisted folder-download component for scanned PS3 directory
ROMs. It reuses the existing component member and immutable manifest safety
model without assigning PC DLC, update, installer, metadata, or media meaning.

## Implementation

- Renamed the bounded scan primitive to a neutral folder inventory while
  retaining compatibility aliases for the Windows quick-scan callers. Existing
  entry, depth, deadline, storage capability, and structural revalidation
  limits remain unchanged.
- Added `FSRomsHandler.get_folder_download_component`, which accepts only a
  complete inventory, verifies each file identity before and after SHA-256
  capture, and persists source-relative paths, sizes, and hashes in one
  `folder-download` group.
- Added `RomComponentKind.FOLDER` and Alembic revision
  `0149_folder_download_component_kind` for PostgreSQL, MariaDB, and MySQL.
- Corrected the plan's lifecycle assumption: `windows_quick_execution.py` is
  Windows-only. The generic group is therefore reconciled by the regular
  nested PS3 scan path in `scan_handler.py`, inside the existing scan media
  write boundary. Incomplete inventory, mapped-read failure, denied access,
  missing source, or hash instability reconciles an empty component set so no
  stale partial PS3 folder group remains selectable.

## Verification

- `trunk check backend/handler/filesystem/pc_scan_inventory.py backend/handler/filesystem/roms_handler.py backend/handler/scan_handler.py backend/models/rom.py backend/alembic/versions/0149_folder_download_component_kind.py`
  completed with no new issues. Trunk reported one pre-existing issue and that
  the migration is ignored by its mypy configuration.
- No tests were added, modified, or run. No Docker or browser work was used,
  per the pre-UAT constraints.

## Notes for Follow-up Plans

- The persisted neutral group is available to the existing manifest ownership
  model but is not yet exposed as a response capability or rendered by the
  frontend. Those changes remain for dependent plans.
