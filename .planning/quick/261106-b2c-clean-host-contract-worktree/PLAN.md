---
quick_id: 261106-b2c
title: Clean host-contract worktree
status: in_progress
parent_phase: 40
---

# Plan

1. Inventory the non-planning worktree diff that caused `ci-host-contracts`.
2. Commit the confirmed repository instruction update without altering tests or
   the host-contract check.
3. Re-run only the affected host-contract command and record its evidence.
