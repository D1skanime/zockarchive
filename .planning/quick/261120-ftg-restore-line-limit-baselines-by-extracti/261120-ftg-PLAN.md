---
quick_id: 261120-ftg
title: Restore changed-file line-limit baselines
status: in_progress
---

# Restore changed-file line-limit baselines

## Task 1: Inventory only branch-added source lines

- files: `backend/endpoints/roms/__init__.py`, `frontend/src/v2/components/GameDetails/OverviewTab.vue`, `frontend/src/v2/views/GameDetails.vue`, `frontend/src/v2/components/GameDetails/SoundtrackPanel.vue`
- action: Compare the current branch with `main`, identify only code introduced by this assignment, and preserve unrelated legacy content and comments.
- verify: Each changed target has a concrete, cohesive extraction boundary and no baseline file grows beyond the reported pre-branch line count.
- done: The extraction plan names a real owner for each moved responsibility rather than deleting behavior or documentation.

## Task 2: Extract focused OST presentation logic

- files: `frontend/src/v2/components/GameDetails/SoundtrackPanel.vue`, a new focused GameDetails composable or component, affected architecture documentation
- action: Move the new local-soundtrack playlist and mutation orchestration into a cohesive reusable owner while keeping the panel's visible behavior and authorization route unchanged.
- verify: Typecheck and targeted Trunk checks pass; `SoundtrackPanel.vue` is at or below 591 lines.
- done: The panel consumes a narrow interface and the new owner documents the local-file versus owned-media boundary.

## Task 3: Verify and record the line-budget correction

- files: `.planning/STATE.md`, this quick task's summary
- action: Run non-test static verification on the changed files, count affected source files, and record exact unchanged or reduced baselines.
- verify: No test suite runs before Live-UAT; the working tree and staged diff contain only this correction and required documentation.
- done: A committed summary records checks and any source file that is outside this assignment's ownership.
