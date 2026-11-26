---
quick_task: 261126-nf1
slug: review-fix-same-id-match-mit-cover-und-p
status: completed
subsystem: classic match routing
tags: [vue, typescript, metadata, owned-media]
key_files:
  modified:
    - frontend/src/v2/components/MatchRom/types.ts
    - frontend/src/v2/components/Dialogs/MatchRomDialog.vue
decisions:
  - Refresh owned media only for a complete, normalized no-change classic match payload.
completed: 2026-11-26
---

# Quick Task 261126-nf1: Preserve same-ID manual-match metadata selections

A classic manual match now compares its complete normalized update payload, so
a same-IGDB selection with changed metadata continues through `updateRom` and
retains the established canonical conflict recovery.

## Changes

- Added `isUnchangedClassicMatchPayload`, a typed predicate for the selected
  metadata, normalized cover, manual metadata state, and every provider ID that
  `updateRom` serializes.
- Replaced the IGDB-ID-only shortcut in `MatchRomDialog` with that predicate.
  Only an entirely equal payload calls `refreshOwnedMedia`; every change uses
  the existing `updateRom` call, locale, optimistic version, and 409 recovery.

## Verification

- `git diff --check` passed.
- `trunk fmt && trunk check` passed with no issues.
- `cd frontend && npm run typecheck` passed.
- `cd frontend && npm run build` passed. It retained existing Lightning CSS
  `:deep`, third-party `vue3-pdf-app` `eval`, and chunk-size warnings.
- No repository test, test suite, Playwright run, or ad-hoc contract script was
  created or run, as required by the quick plan.

## Browser Inspection

Browser interaction was unavailable in this execution environment. The approved
local development endpoint was detected on port 3000, but no browser binary
(`chromium`, `chromium-browser`, `google-chrome`, or `firefox`) and no browser
control capability were available. No server, Docker container, provider,
production system, or NAS mount was started or accessed. Consequently, neither
the changed same-ID `updateRom` request nor the unchanged
`/api/roms/{id}/media/refresh` request could be observed, and no artificial 409
was generated.

## Documentation

No architecture documentation changed. This is a client-side request-selection
correction within the documented match and owned-media-recovery boundaries; it
does not change a public API, provider-media policy, ownership boundary, or user
workflow.

## Deviations from Plan

None. Browser inspection was not fabricated because the required local browser
capability is unavailable, as explicitly permitted by the execution request.

## Known Stubs

None.

## Self-Check: PASSED

- `frontend/src/v2/components/MatchRom/types.ts` exists with the typed
  full-payload predicate.
- `frontend/src/v2/components/Dialogs/MatchRomDialog.vue` uses the predicate
  before choosing refresh-only routing.
- `e06d6b041` exists in Git history with the implementation change.
