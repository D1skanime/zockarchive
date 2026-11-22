---
quick_id: 261122-klq
title: Add direct post-UAT tests for selected-child completion fencing
status: in_progress
---

# Plan

1. Add focused unit tests for the completion-fence handler only, covering
   normal finalization, explicit exactly-once recording, post-scan failure,
   and preservation of an earlier error when checkpoint persistence fails.
2. Run the new test file and the directly affected collection-promotion
   integration test file in the isolated MariaDB target.
3. Correct the normal-return control flow exposed by the retained direct test:
   it must finalize the bound completion checkpoint before returning, while
   preserving the existing error-path behavior.
4. Record the results in the Quick summary and project state, then commit the
   focused handler correction, retained test, and planning artifacts.

## Test classification

- TDD: `scan_identification_completion.py`, a context-local state machine with
  deterministic callbacks and error paths.
- Skip: browser/UI flows, because the accepted behavior is backend fencing and
  the user explicitly excludes click-simulation tests.
