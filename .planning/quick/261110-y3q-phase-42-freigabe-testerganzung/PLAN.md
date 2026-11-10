---
quick_task: 261110-y3q
status: planned
---

# Phase 42 post-acceptance test completion

## Scope

Add direct unit coverage for the remaining accepted Phase 42 settings contract:

1. A missing per-account preference initializes as enabled, while an explicit
   false value is ready before recommendations can render.
2. Rapid direct changes to the preference persist the false and later true
   payload in order, so an older request cannot restore the stale value.

Only test and planning files may change. No DOM interaction or snapshots are
used.

## Validation

Run the affected UI-settings and similar-game resolver Vitest files.
