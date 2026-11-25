---
id: 261125-1uj
title: Reconcile neutral inventory from the current PC component snapshot
status: complete
date: 2026-11-25
job_id: 261125-6c73
commit: 10775d67b
---

# Quick Task 261125-1uj Summary

The neutral shared-download inventory reconciliation now retains components
persisted by the preceding PC scan instead of reading a stale ROM snapshot.

## Changes

- Keep the existing newly created ROM for non-PC and unchanged PC scan paths.
- Replace that reconciliation input with the ROM reloaded after successful PC
  component synchronization, so current non-`FOLDER` components are retained.
- Document the snapshot invariant beside the reload without changing manifest,
  inventory, permission, hashing, filesystem, or platform logic.

## Verification

- Passed `git diff --check`.
- Passed targeted `trunk check backend/handler/scan_handler.py` with no new
  issues (one existing issue remains outside this change).
- No tests were created, modified, or run. No browser checks, deployment, or
  data operations were performed before live UAT.

## UAT Follow-up

- Run a full scan of a nested Windows ROM that produces PC components, then
  verify those components remain visible after neutral manifest inventory is
  reconciled.
- Confirm an ordinary PC single-file download and an existing non-PC shared
  download still work through their established paths.

## Self-Check: PASSED

- Commit `10775d67b` contains only the intended scan-handler correction.
- The quick plan and this summary are stored in the assigned quick-task folder.
