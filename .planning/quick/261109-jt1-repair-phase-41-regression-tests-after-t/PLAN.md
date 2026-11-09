---
quick_id: 261109-jt1
phase: 41
status: in_progress
---

# Repair Phase 41 regression tests after bounded snapshots

## Scope

- Update only the failing test expectations and test patch targets after the
  approved bounded scan-result snapshot and socket-module split.
- Keep product code unchanged: callers must explicitly request result rows,
  and socket tests must patch the module that owns their dependency.
- Add the missing type annotation required by the repository type check.

## Steps

1. Make the metadata-result tests request `include_items=True` when they
   assert durable result rows, and move the filesystem-handler patch to the
   platform-identification module that owns it.
2. Type the result-classification table in the operation test.
3. Run the three affected MariaDB tests and scoped Trunk check, then record
   the exact evidence in `SUMMARY.md` and `STATE.md` before committing.
