---
quick_id: 261119-jd8
title: Restore Home source line budget
status: complete
---

# Summary

The direct Library Management route remains unchanged and continues to target
`?tab=direct`. Removed three redundant blank lines in its surrounding local
declaration block, returning `Home.vue` to its prior 684-line size.

The reported backend files were not changed because both are already at or
below their baseline sizes.

## Validation

- `trunk fmt --no-progress frontend/src/v2/views/Home.vue`
- `trunk check --ci --no-progress frontend/src/v2/views/Home.vue`
- Confirmed line counts: `Home.vue` 684, `roms_handler.py` 1324,
  `archives.py` 727.

No tests were added or run before live UAT.
