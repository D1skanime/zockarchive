---
phase: 49-za-beta14-upgrade-ohne-downloadinventur-reparieren
plan: 03
status: complete
wave: 3
---

# Plan 49-03 Summary

## Outcome

The v2 Game Download surface now consumes the generated folder-download state
without client-side platform, size, or source inference. A `preparable`
capability continues to expose the existing Game Download tab, selection
dialog, whole-folder manifest POST, and browser queue. The existing launcher
shows its loading state while that authorized POST prepares the inventory and
retains its existing error snackbar when preparation or manifest issuance is
rejected.

Only a `ready` capability renders the verified member-count and byte-total
summary. A preparable capability renders neither aggregate data nor a member
list, path, hash, synthetic selection, or preparatory manifest. The existing
standard/enhanced selector, directory-picker timing, queue, transfer manager,
progress, cancellation, retry, resume, PC component/archive-set, PS3 ISO, and
ordinary direct-download paths are unchanged.

`docs/FRONTEND_ARCHITECTURE.md` now records the server-driven `ready` versus
`preparable` contract, the read-only detail projection, and the shared
authorized POST, dialog, queue, and standard/enhanced fallback lifecycle.

## Human Dev UAT Handoff

Use the existing detailed-ROM route (`/rom/{romId}`) on desktop and mobile.
No browser evidence was created by this job.

1. Open the legacy PS3 folder ROM with persisted `RomFile` rows and no FOLDER
   inventory. The Game Download tab should be reachable. It must not show a
   verified file count or byte total. Starting the existing download action
   should show its loading state, perform preparation only after the click,
   and continue with the normal queue only after the server returns a manifest.
2. Check ready PC and ready PS3 folder ROMs. Their verified count and total,
   existing dialog choices, standard/enhanced delivery, progress, cancel,
   retry, resume, and enhanced-browser fallback should remain available.
3. Check a PS3 ISO or other single-file ROM, another-platform source just
   below, exactly at, and above the 4,000,000,000-byte boundary, and an
   unknown-size source. Each must retain its server-provided ordinary-download
   or whole-source availability without a browser-side eligibility decision.
4. For denied, stale, unreadable, and path-boundary sources, confirm that no
   files or aggregates are exposed and that the existing bounded server error
   path is shown after an authorized action where applicable.

## Verification

- `git diff --check` completed successfully.
- `npm --prefix frontend run typecheck` completed successfully.
- Scoped `trunk check` over all Phase 49 backend, frontend, generated, and
  documentation files completed with `Checked 8 files` and `No issues`.
  Generated frontend models are ignored by the repository Trunk configuration.
- `npm --prefix frontend run build` completed successfully. It emitted existing
  non-fatal warnings for legacy `:deep` CSS syntax, large chunks, and direct
  `eval` in `vue3-pdf-app`.
- No automated tests, browser harness or inspection, Docker, Dev, NAS,
  production operation, commit, push, merge, or branch operation was run.
