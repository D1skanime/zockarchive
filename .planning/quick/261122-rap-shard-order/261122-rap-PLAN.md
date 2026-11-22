---
quick_id: 261122-rap
title: Reproduce RetroAchievements progress shard isolation failure
status: complete
---

# Reproduce RetroAchievements progress shard isolation failure

## Scope
Reproduce the full-suite-only RetroAchievements progress regression in the
same MariaDB shard and correct its mock or singleton isolation cause.

## Steps
1. Reconstruct the failing shard from the CI test-selection algorithm.
2. Run that whole shard through the disposable Phase 34 target.
3. Trace the handler instance used by the task against the test double.
4. Correct the responsible isolation boundary and rerun the whole shard.

## Acceptance criteria
- The exact shard that previously reported 825 passes and two failures passes.
- The two progress tests continue to assert a write for valid progression.
- No skip, baseline, fencing, or integrity behavior is weakened.
