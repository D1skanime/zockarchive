---
quick_task: 261110-j1o
status: planned
---

# Phase 42 accepted behaviour tests

## Scope

Add direct unit coverage only, after human live acceptance:

1. Verify ordered, serialized user-settings persistence for rapid switch
   changes, including the backend payloads.
2. Verify similar-game resolution's deduplicated lookup, filter-before-limit,
   error handling and stale-response guard.

No production source, interaction simulation or rendering snapshot is changed.

## Validation

Run the two affected Vitest files and confirm they pass.
