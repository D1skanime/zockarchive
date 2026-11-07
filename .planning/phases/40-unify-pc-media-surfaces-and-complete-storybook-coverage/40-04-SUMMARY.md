---
phase: 40
plan: 04
status: complete
completed: 2026-11-04
---

# Phase 40 Plan 04 Summary

## Outcome

The isolated runner now preserves the canonical `tests/fixtures` source layout
inside its disposable checkout and exposes it read-only at `/app/tests/fixtures`.
The manifest test again evaluates the committed fixture, while the source tree
and temporary resources remain unchanged after cleanup.

## Verification evidence

- `python3 backend/tools/phase34.py guard-test` passed, 39 tests.
- The named isolated MariaDB manifest test passed:
  `tests/handler/filesystem/test_roms_handler.py::TestPcComponentManifests::test_committed_pc_library_fixture_keeps_unknown_folders_unresolved`.
- The exact nine-file PC-media MariaDB selection passed with 350 tests, 0 failures,
  0 errors, and 1 expected permission skip. Its JUnit receipt records the named
  manifest, component-resource, endpoint, ROM, database, filesystem, and model
  tests; disposable cleanup and source immutability passed.
- Scoped `trunk fmt` and `trunk check` passed for the four changed fixture-runner
  files.

## Scope preserved

The prescribed wrapper was invoked first, but after the runner-support change it
correctly classified the whole backend suite as shared-dependency work. It was
interrupted before test execution because Phase 40 deliberately excludes a full
regression before human UAT. The exact originally selected nine files were run
instead in the same isolated MariaDB mechanism.
