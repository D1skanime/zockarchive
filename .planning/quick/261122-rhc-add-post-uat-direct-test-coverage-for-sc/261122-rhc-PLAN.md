---
quick_id: 261122-rhc
title: Add direct recovery cursor continuity coverage
status: complete
---

# Add direct recovery cursor continuity coverage

## Scope

Add direct post-UAT coverage for the accepted scan-media recovery cursor
continuity behavior without changing production code.

## Steps

1. Model a directory entry that vanishes after enumeration and before `stat`.
2. Assert the recovery walker resets only that directory's advisory cookie.
3. Run the new test and the directly affected recovery boundaries.

## Acceptance criteria

- A disappeared child cannot leave the cursor after an unstable directory cookie.
- The test calls the recovery-walker logic directly.
- Only tests and GSD planning files change.
