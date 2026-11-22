---
quick_id: 261122-rhc
title: Add direct recovery cursor continuity coverage
status: complete
---

# Add direct recovery cursor continuity coverage

## Result

Added a direct `RecoveryWalk.step` contract for the interval between directory
enumeration and `stat`: a vanished child leaves the current directory in the
cursor stack but resets its advisory cookie to zero. The existing integration
contract continues to prove that later sibling receipts are actually reached.

## Verification

- `trunk check backend/tests/handler/test_media_recovery_continuity.py` passed.
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 600
  tests/handler/test_media_recovery_continuity.py
  tests/handler/test_media_recovery_cursor.py
  tests/handler/test_scan_media_publication.py` passed: `111 passed`.

Only test and GSD planning files changed. No full test suite was run.
