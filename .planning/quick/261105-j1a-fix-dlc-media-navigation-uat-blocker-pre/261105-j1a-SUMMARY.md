---
quick_id: 261105-j1a
status: complete
completed: 2026-11-05
commits: c4d5338a0, f133359a7
---

# Restore DLC media navigation after live UAT failure

## Outcome

The actual UAT navigation failure was reproduced and corrected. A gallery
string ref inside a repeated panel supplied an array to `ResizeObserver`; an
independent stale-query race could also restore the previous primary tab after
Media mounted. The fix uses an HTMLElement callback ref and a bounded primary
tab router synchronizer.

The new fixture-backed Playwright case enters Media before clicking Overview,
Game downloads, Files, and Notes at desktop and 390 px. It also uses the
overflow-menu Artwork entry, which now routes through the same synchronizer
rather than bypassing it. The post-fix authenticated UAT proof repeated the
reported non-mutating direct-tab flow at both widths.

## Scope alignment

DLC media now exposes only Screenshots and Artwork. Existing stored component
media and backend compatibility contracts remain intact, but no DLC manual,
soundtrack, or background-placement UI is offered. Component image cards offer
overview placement and deletion; cover/poster selection remains separate.

## Verification

- `vitest run PcDlcMediaTab.behavior.test.ts`: 10 passed.
- `npm run typecheck`: passed.
- Isolated build plus the single DLC primary-navigation Playwright regression:
  1 passed, including hit-target, pointer-event, focus, direct-tab and
  overflow-menu assertions.
- Scoped Trunk check and `git diff --check`: passed.
- Authenticated UAT browser proof at 1440 px and 390 px: passed without page
  errors or UAT mutations.

No full frontend or MariaDB suite was run before renewed live UAT.
