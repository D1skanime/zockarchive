---
quick_id: 261122-smr-tests
title: Test terminal scan-media recovery priority
status: complete
---

# Test terminal scan-media recovery priority

## Result

Added a direct recovery-handler contract for a confirmed terminal receipt with
a one-item recovery budget. The receipt is reconciled before the advisory
cursor traversal can start.

## Verification

- `trunk check backend/tests/handler/test_media_recovery_cursor.py` passed.
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 600
  tests/handler/test_media_recovery_cursor.py
  tests/handler/test_scan_media_publication.py` passed.

Only test and GSD planning files changed. No full test suite was run.
