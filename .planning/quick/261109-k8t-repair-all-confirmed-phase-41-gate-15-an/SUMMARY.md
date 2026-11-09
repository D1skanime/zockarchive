---
quick_id: 261109-k8t
phase: 41
status: complete
---

# Repair confirmed Phase 41 Gate 15 and Gate 16 MariaDB regressions

## Delivered

- `record_checked_game()` now derives the mapping-relative game path from the
  validated mapping, so nested collection promotion and replay retain their
  scope fence.
- Kept the durable `game_results_complete` marker across rollback and updated
  existing tests to request result pages or inspect private diagnostics where
  appropriate.
- Routed stale socket-facade test mocks to their focused module owners.

## Verification

- Collection promotion: 7 passed.
- Inventory status: 18 passed.
- Socket scan: 115 passed.
- Remaining affected group: 128 passed, 2 stale catalog test doubles fixed;
  catalog removal re-run: 12 passed.
- Scoped Trunk check: no new issues.

## Scope

- Product fix commit: `a04560381` (`fix: Scan-Ergebnispfade absichern`).
- No new tests were added before renewed live UAT.
