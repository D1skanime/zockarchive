---
phase: 47-za-game-download-ansicht-bereinigen-und-vorhandenen-pc-downl
plan: 03
status: complete
wave: 3
---

# Plan 47-03 Summary

## Outcome

The v2 Game Download surface is now driven by actual manifest-backed download
capabilities. Eligible PS3 folders use the existing browser download queue and
the console patcher remains available for console ROMs without that capability.

## Implementation

- Removed the parent metadata search and local-media review controls only from
  the Game Download panel. Their dedicated metadata and media surfaces remain
  unchanged.
- Added a narrow local projection for the pending generated `folder_download`
  API field. A folder-capable ROM exposes Game Download even when it is not a
  PC platform, while archive sets load only for actual component inventory.
- Kept PC component and archive-set behaviour intact. Folder downloads render
  one disabled, accessible summary card with server-supplied file count and
  byte total, never their individual members.
- Sent `whole_folder: true` as the sole selection for a folder. The existing
  manifest endpoint and `useBrowserDownloadQueue` continue to own standard and
  enhanced starts, progress, cancellation, retry, and resume.
- Clarified English and German standard-mode text: browsers receive files
  individually and may not retain folder structure. Enhanced mode remains the
  topology-preserving flow.

## Verification

- `cd frontend && npm run typecheck` passed.
- `cd frontend && python3 src/locales/check_i18n_locales.py` passed.
- `cd frontend && python3 src/locales/check_i18n_sorted.py` passed.
- `git diff --check` passed.

No tests, browser automation, browser inspection, Docker resources, or commits
were run or created, as required before live UAT. Documentation work belongs to
plan 47-04.
