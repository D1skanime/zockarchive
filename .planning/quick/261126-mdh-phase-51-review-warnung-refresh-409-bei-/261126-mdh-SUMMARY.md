---
quick_task: 261126-mdh
slug: phase-51-review-warnung-refresh-409-bei
status: completed
subsystem: provider-owned media refresh
tags: [vue, axios, pinia, conflict-recovery]
key_files:
  modified:
    - frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue
decisions:
  - A failed canonical reload after a media-refresh conflict is advisory and never replaces the original refresh failure.
completed: 2026-11-26
---

# Quick Task 261126-mdh: Preserve 409 refresh feedback after reload failure

The single-ROM owned-media refresh now treats its HTTP-409 canonical ROM reload
as best effort. A failed reload is logged without replacing the dialog's current
ROM, while the original protected refresh error always remains visible and the
control becomes retryable.

## Changes

- Wrapped only the existing 409 `romsStore.refreshRom(rom.id)` recovery and
  dialog-local replacement in a nested `try`/`catch`.
- Logged canonical reload failures with the existing concise `console.error`
  convention.
- Kept `snackbar.error(errorMessage(error))` outside the recovery boundary, so
  it reports the original media-refresh failure without a false success or
  dialog close.

## Verification

- Disposable source contract passed:
  `node /tmp/za-phase51-wr01/refresh_dialog_contract.mjs frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue`.
- `git diff --check` passed.
- `trunk fmt && trunk check` passed with no new issues (four existing issues
  remain outside this change).
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed. The build printed pre-existing
  Lightning CSS `:deep` and third-party `vue3-pdf-app` `eval` warnings.

No repository test suite, browser automation, Docker, provider service, NAS,
deployment, or live runtime resource was used. The temporary contract harness
is outside the repository at `/tmp/za-phase51-wr01/`.

## Documentation

No architecture documentation changed. This is local error containment in the
already documented canonical-recovery contract and does not alter a public data
flow, API, ownership boundary, or user workflow.

## Deviations from Plan

None.

## Known Stubs

None.

## Self-Check: PASSED

- `frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue` exists with
  the guarded 409 recovery.
- The disposable source contract completed successfully.
- `5df1b497e` and `730ddc60f` exist in Git history.
