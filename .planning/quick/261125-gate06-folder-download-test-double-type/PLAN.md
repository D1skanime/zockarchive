---
id: 261125-gate06-folder-download-test-double-type
title: Repair the typed folder-download eligibility test double
status: complete
scope: test-and-planning-only
---

# Quick Plan

Repair the one new Trunk/mypy finding in
`backend/tests/handler/test_scan_folder_download.py` without changing product
behavior or weakening the accepted assertions.

1. Confirm the existing test convention in this file: `SimpleNamespace` is a
   deliberately minimal runtime double, and direct calls to helpers typed for
   `Rom` use `typing.cast(Rom, rom)` at the call boundary. In
   `test_shared_inventory_eligibility_keeps_legacy_paths_and_gates_new_platforms`,
   apply that same narrow cast to the `SimpleNamespace` argument passed to
   `_is_shared_download_inventory_eligible`. Do not add a production
   `getattr`, default value, protocol, skip, or relaxed assertion. The double
   already exposes exactly the two model attributes read by the helper:
   `fs_size_bytes` and `has_simple_single_file`.

2. Run only the affected static check for
   `backend/tests/handler/test_scan_folder_download.py` through the repository
   Trunk path. If its local focused command also executes the direct test
   file, use the existing MariaDB CI environment and record that result; do
   not start a full suite or substitute SQLite. No new tests are introduced.

3. Create `SUMMARY.md` with the exact mypy cause, the cast-based test-double
   contract, and the focused Trunk/direct-test result. Add one factual row to
   `.planning/STATE.md`'s Quick Tasks Completed table. Commit only the test
   file and this quick task's planning artifacts with a concise German message.

## Acceptance criteria

- Trunk no longer reports `mypy/arg-type` at line 116 for the `Rom` helper
  call.
- The runtime double remains minimal and its threshold assertions are
  unchanged.
- No product code, test assertions, skips, fixtures outside the affected test
  file, or test-suite scope are weakened or changed.
