---
phase: 42
plan: 01
subsystem: frontend-ui-settings
tags: [vue, settings, account-preference]
requires: []
provides:
  - Account-authoritative similar-games visibility preference
  - Existing settings-row composition for the preference
affects: [42-03]
key_files:
  modified:
    - frontend/src/composables/useUISettings.ts
    - frontend/src/v2/views/Settings/UserInterface.vue
decisions:
  - Missing persisted preference values resolve to enabled only after an active account is known.
  - Similar-game consumers receive readiness and account identity signals to fail closed before initialization.
verification:
  - cd frontend && npm run typecheck
---

# Phase 42 Plan 01: Account-authoritative similar-games preference Summary

Added the persisted default-enabled preference and exposed it through the existing v2 settings toggle.

## Changes

- Registered `showSimilarGamesOutsideLibrary` in the existing UI-settings registry with a `true` default.
- Made initialization reset this setting from the active account's explicit boolean or from the account-safe enabled default, so a prior account's singleton local value cannot leak.
- Exposed `isSimilarGamesOutsideLibraryReady` and `similarGamesOutsideLibraryAccountId` for fail-closed consumers.
- Added one real `SettingsToggleRow` in the Gallery settings grid, bound directly to the persisted ref and the planned locale keys.

## Verification

- `cd frontend && npm run typecheck` passed.

## Deviations from Plan

None.

## Known Limitations

Locale entries and the Similar-games consumer are delivered by the dependent Phase 42 plans. This plan intentionally did not add or run tests before human UAT.
