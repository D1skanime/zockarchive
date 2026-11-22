---
quick_id: 261122-r3p
title: Preserve scan-media recovery directory continuity
status: complete
---

# Preserve scan-media recovery directory continuity

## Cause

Terminal attempts are now reconciled before the advisory cursor. The stopped
attempt in the continuity fixture therefore bypassed the cursor race entirely.
Where the cursor remains necessary, an entry can disappear after `readdir`
returns it but before `stat` verifies it. Continuing with that directory cookie
can skip later siblings because Linux directory cookies are invalidated by the
deletion.

## Implementation

- Reset the current bounded directory pass when its selected entry disappears,
  preserving later sibling receipt reachability without adding recovery
  authority or expanding the work budget.
- Keep terminal-attempt priority intact and isolate the cursor continuity
  contract from that direct path in the existing integration test.
- Document the directory-cookie continuity invariant.

## Verification

- `trunk check backend/handler/filesystem/scan_media_traversal.py
  backend/tests/handler/test_media_recovery_continuity.py
  docs/BACKEND_ARCHITECTURE.md` passed.
- Focused isolated MariaDB target for continuity, cursor priority and
  crash-publication boundaries passed: `110 passed`.
- Identical full MariaDB CI shard 7 passed: `524 passed, 17 warnings,
  73 subtests passed`.

No full regression run was started. The full-shard result is the required
same-harness proof for the reported failure.
