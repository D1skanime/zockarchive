---
phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
plan: 03
subsystem: game-details
tags: [vue, igdb, related-games, authorization]
requires: [42-01, 42-02]
provides:
  - Controlled Similar-game rendering from centralized library resolution
  - Local ZA destinations without duplicate card-level lookup
affects: [game-details, related-games]
tech-stack:
  added: []
  patterns: ["filter before limit", "resolver-owned Similar navigation"]
key-files:
  modified:
    - frontend/src/v2/views/GameDetails.vue
    - frontend/src/v2/components/GameDetails/OverviewTab.vue
    - frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue
    - frontend/src/v2/components/GameDetails/RelatedGameCard.vue
decisions:
  - Full Similar-game provider order reaches the resolver before its visible six-card result is rendered.
  - Only resolver-confirmed local Similar cards receive an internal ROM destination; controlled cards suppress duplicate lookup.
completed: 2026-11-10
---

# Phase 42 Plan 03: Controlled Similar-game rendering Summary

**The live game overview now renders resolver-filtered Similar games, preserving local ZA navigation and safe external fallbacks only when enabled.**

## Accomplishments

- Removed the early Similar-games limit and passed the full current-route provider list, account preference, and readiness context to the account-safe resolver.
- Mounted the localized Similar-games section only when resolver-visible entries exist, so disabled pending, error-only, and no-match states have neither heading nor grid.
- Added a narrow controlled grid/card path that uses resolver-provided local ROM IDs and suppresses per-card ownership lookup, while every other related-content path remains unchanged.

## Verification

- `cd frontend && npm run typecheck` passed.
- No tests or test suites were created or run, per the pre-UAT constraint.

## Deviations from Plan

### Auto-fixed Issues

1. [Rule 1 - Type safety] Normalized controlled and legacy grid card data to one template-safe shape.
   - **Found during:** Task 2
   - **Fix:** Added explicit undefined values for fields unavailable on the other rendering path.

## Known Stubs

None.

## Self-Check: PASSED

- All four planned production files exist and the controlled path is connected from the detail view to the card.
