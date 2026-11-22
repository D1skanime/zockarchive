---
quick_id: 261119-g7m
title: Anchor Scan result filter popup
status: complete
completed: 2026-11-19
---

# Summary

- Reproduced the Scan result filter menu at the viewport corner after scrolling.
  The select activator and teleported panel were passed as Vue refs through
  component props, which unwraps their values before the child can assign them.
- ZASelect now supplies explicit element-ref callbacks to its activator, value
  measurement, and teleported menu components. Floating UI receives both live
  elements and is explicitly updated after the panel mount, preserving fixed
  positioning, flip, shift, and size behavior.
- Browser inspection against the isolated current-source server confirmed the
  result menu is adjacent to its field at 1440 px and flips inside the 390 px
  viewport. The current result snapshot contains 41 games; its PlayStation 3
  dummy entries are recorded as skipped, so no Unidentified match is expected
  from that snapshot. No Windows subfolder action was available in this
  terminal snapshot, so that data-dependent action remains for live UAT.

`npm run typecheck` and targeted Trunk checks passed. No tests were added or
run. No architecture document changed because the shared select public
contract and scan workflow are unchanged.
