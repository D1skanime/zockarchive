---
quick_id: 261119-kpu
title: Restore complete Scan live-progress scrolling
status: complete
---

# Summary

The scoped stylesheet attached to `ScanViewContent` only reached the root of
the `ScanLiveProgress` child component. Its nested log did not receive the
required flex sizing or vertical overflow rules, so a long platform expanded
the card instead of making the card scrollable.

The Scan stylesheet is now feature-scoped by its `r-v2-scan-*` selectors
rather than Vue-scoped, so the complete live-progress component tree receives
the scroll layout. Narrow layouts also reserve the fixed BottomNav height in
the log's final scroll position.

## Validation

- Isolated current-browser Pinia projection rendered 22 PlayStation 3 rows,
  including `Nicht identifiziert`, in active and terminal states.
- Wheel scrolling reached the final row on desktop (`869/869`) and mobile
  (`1113/1113`). On mobile the final row ended above the BottomNav.
- `trunk fmt --no-progress` and targeted `trunk check --ci --no-progress`
  passed.
- `npm run typecheck` passed.

No test suite was run before live UAT. The temporary browser script and its
in-memory projection were removed; no production or NAS resource changed.
