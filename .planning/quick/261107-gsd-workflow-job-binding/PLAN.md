---
quick_id: 261107-gsd-workflow-job-binding
status: complete
phase: 41
---

# Quick Task: Repair GSD job binding evidence

## Cause

The job-to-phase JSON binding existed, but the Phase 41 GSD context did not explicitly name the active ki-run job. The quality gate therefore could not establish the association from phase artifacts alone.

## Tasks

1. Preserve the existing `.planning/ki-run/261107-8ee7.json` binding with its exact `job_id` and `phase_dir`.
2. Add the same explicit job reference and binding path to `41-CONTEXT.md` without changing implementation, plans, verification, or tests.

## Verification

Inspect the mapping JSON and context text. Run no tests or test suites before live UAT.
