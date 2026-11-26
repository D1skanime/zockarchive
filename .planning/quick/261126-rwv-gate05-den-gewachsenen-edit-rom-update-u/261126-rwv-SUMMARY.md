---
status: complete
quick_id: 261126-rwv
---

# Quick Task Summary: Decompose Edit ROM update and conflict recovery

The Gate05 line-limit finding was confirmed. `EditRomDialog.vue` had grown to
580 lines, exceeding both its 561-line pre-change baseline and the repository
limit. The provider-media conflict recovery remains part of the same Edit ROM
mutation, so it now has a focused v2 composable owner instead of adding another
dialog-local update path.

`useEditRomUpdate()` owns the saving guard, request, canonical provider-media
reload, collection and active-detail synchronization, toast selection, error
logging, and final settlement. The dialog retains editable state, form and
cover interactions, tabs, and event wiring. Its callback receives both normal
and canonically recovered ROM data. The composable's local domain comment
documents why a media publication conflict may follow a durably persisted
metadata edit.

No product architecture documentation changed. This extraction neither changes
the public API nor the existing v2 data flow or ownership boundary; it moves an
already cohesive dialog operation into the established composable layer.

## Verification

- `trunk check -- frontend/src/v2/components/Dialogs/EditRomDialog.vue frontend/src/v2/composables/useEditRomUpdate/index.ts`: passed, no issues.
- `npm run typecheck`: passed.
- `npm run build`: passed. Existing Lightning CSS `:deep` warnings, direct
  `eval` warnings from `vue3-pdf-app`, and chunk-size warnings remain.
- `git diff --check`: passed.
- Runtime source sizes: `EditRomDialog.vue` is 534 lines and
  `useEditRomUpdate/index.ts` is 82 lines.
- No tests or test suites were created, changed, weakened, or run, as required
  before live acceptance.
- Browser inspection was not performed because no supported browser-control
  capability is available on this host.

## Commits

- `a8f87c8c7 refactor(za): Edit-ROM-Update auslagern`

## Self-Check: PASSED
