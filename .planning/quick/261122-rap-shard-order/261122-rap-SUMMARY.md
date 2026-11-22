---
quick_id: 261122-rap
title: Reproduce RetroAchievements progress shard isolation failure
status: complete
---

# Reproduce RetroAchievements progress shard isolation failure

## Root cause
`SyncRetroAchievementsProgressTask` retains imported singleton collaborators.
The two progress tests patched handler classes instead of the task module's
actual `db_user_handler` and `meta_ra_handler` references. In the complete
Shard 6 module sequence, the class-level `update_user` mock did not observe
the singleton call: the task logged an update while the mock remained at zero.

The tests now patch exactly the imported singleton collaborators while keeping
the original required-write assertions unchanged. This corrects mock isolation
without altering the task, its progress update behavior, or production code.

## Verification
- Reproduced before the correction with `python3 backend/tools/ci_target.py
  --dialect mariadb --shard 6 pytest`: 825 passed, 2 failed.
- Re-ran the same 36-file MariaDB Shard 6 after the correction: 827 passed,
  6 warnings, 12 subtests passed in 382.67 seconds.
- The task test followed `test_cleanup_orphaned_resources.py` and
  `test_recompute_save_content_hashes.py` in that exact selection.
- `trunk check backend/tests/tasks/test_sync_retroachievements_progress.py`
  passed.

No skips, baselines, production integrity behavior, or application code changed.
