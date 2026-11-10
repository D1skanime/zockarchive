---
quick_task: 261110-hpm
status: planned
---

# Serialize UI setting persistence

## Problem

The Phase 42 outside-library switch can emit two consecutive settings writes.
The backend may complete them out of order, so a hard reload can restore the
older value for the active account.

## Plan

1. Serialize account-scoped `useUISettings` writes while retaining the existing
   account and latest-response guards.
2. Recheck the real login, toggle, reload and Storybook flows at desktop and
   mobile widths. No tests are added or run before live acceptance.

## Acceptance

- A rapid `true -> false` transition persists `false` after a hard reload.
- A later response cannot overwrite the current account's local state.
- No tests are weakened or added.
