---
quick_id: 261106-jz1
title: TypeScript null safety for active cover source
status: in_progress
parent_phase: 40
wave: 1
depends_on: []
---

# TypeScript null safety for active cover source

## Finding

`currentRom` may be absent while the computed active-cover source is evaluated.
The template is mount-gated, but TypeScript correctly rejects the later use of
`rom.id` without a narrowed local value.

## Implementation

1. Return before candidate lookup when no current ROM exists.
2. Run the affected frontend typecheck only, then record the result and commit.

## Acceptance

- `GameDetails.vue` has no nullable `rom` access.
- The frontend typecheck has no error for this source.
