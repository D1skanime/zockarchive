---
quick_id: 261122-0ek
title: Protect selected-child parent retirement from post-identification failures
status: complete
completed: 2026-11-22
---

# Result

- Added a context-local completion fence around the entire ROM identification
  routine. It binds only after `merge_scan_rom` persists the child and commits
  the existing collection-promotion checkpoint after any later generic error.
- A checkpoint failure cannot replace the original scan error. On normal
  completion, hash and metadata-only paths still record the child exactly once.
- Documented the completion-fence boundary in the backend architecture guide.

## Verification

- Python source compilation without bytecode output passed.
- Targeted Trunk lint passed with no new issues.
- Browser: normal form login and `/scan` loaded at desktop width. The current
  Dev result list had no Tales parent row, so the selected-child dialog could
  not be opened without creating new scan data. Screenshot:
  `review-parent-retirement-pending-scan.png`.

No test suite, NAS access, production mutation, merge, push, or release ran.
