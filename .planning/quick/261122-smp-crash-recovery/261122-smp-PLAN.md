---
quick_id: 261122-smp
title: Make scan-media crash recovery deterministic
status: in_progress
---

# Scan-media crash-recovery repair

## Scope

Reproduce the prepared and published process-crash recovery boundaries recorded
by Gate 51. Preserve manifest validation and owned-content proof requirements,
then make only the cleanup path deterministic.

## Steps

1. Capture the receipts and filesystem state after each crash boundary in the
   disposable MariaDB target.
2. Correct the specific recovery sequencing or receipt handling that retains
   an unreferenced generated private or final file.
3. Run the crash contract and the directly related regression tests, inspect
   the browser-visible scan state, update planning state, and commit.

## Acceptance criteria

- Prepared and published crash boundaries remove only unreferenced generated
  media after the attempt is terminal.
- Committed media remains referenced and intact.
- No manifest validation, content proof, fence, or ownership check is relaxed.
