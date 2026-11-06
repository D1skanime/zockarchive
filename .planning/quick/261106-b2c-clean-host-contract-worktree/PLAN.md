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
4. If the clean rerun surfaces a host prerequisite failure, repair the tool's
   interpreter boundary without relaxing any contract assertions.
5. Keep the response contract below its pre-change line count by moving the
   original-cover source fields into their own response schema.
