---
quick_id: 261119-kpu
title: Restore complete Scan live-progress scrolling
status: complete
---

# Plan

1. Trace the Scan live-progress scroll chain from the sticky card through the
   platform collapsible and virtual scroller. Reproduce a 22-row platform in
   an isolated browser projection for both running and terminal states.
2. Correct the responsible layout or scroll ownership so the live-log card,
   rather than a clipped descendant, owns vertical scrolling. Preserve the
   existing collapsible and virtualized row behavior.
3. Inspect the corrected flow in a real browser at desktop and narrow
   breakpoints with wheel scrolling. Record the last reachable row and both
   statuses in the UAT report, then commit the implementation and Quick
   artifacts.

# Acceptance criteria

- A 22-title platform, including an Unidentified row, reaches its final row
  with wheel scrolling while running and after completion.
- No row is clipped at the bottom of the progress card.
- Desktop and narrow layouts retain usable Scan actions and platform headers.
- No tests are added or run before live UAT.
