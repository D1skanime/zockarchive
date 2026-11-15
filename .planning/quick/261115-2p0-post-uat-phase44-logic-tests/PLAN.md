---
quick_id: 261115-2p0
status: in_progress
phase: 44
---

# Quick Task: Add accepted Phase 44 logic coverage

## Scope

Add only direct unit tests for the live-UAT-approved direct-folder mapping and
scan-readiness behavior. Product code remains unchanged.

## Plan

1. Cover the storage readiness error classification: a missing platform mapping
   is absent rather than fatal, while unrelated conflicts remain observable.
2. Cover the shared direct-folder readiness resolver so only active saved direct
   assignments take part in scan readiness, while exclusions do not.
3. Cover the generic mapping projection so direct folders, including exclusions,
   are never requested or presented as automatic storage mappings.
4. Update the existing Home source-contract assertion for the extracted shared
   resolver, run the new and affected frontend/backend tests, update STATE and
   write the quick summary.

## Acceptance criteria

- Tests invoke services and functions directly, with no browser interaction or
  snapshots.
- The test diff contains only test files and GSD planning artifacts.
- New and affected focused suites pass.
