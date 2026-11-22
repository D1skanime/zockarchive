---
quick_id: 261122-smp-tests
title: Add scan-media recovery cursor regression tests
status: complete
---

# Scan-media recovery test coverage

## Added coverage

`test_media_recovery_cursor.py` now verifies the recovery decision directly:
a resumed cursor restarts once and processes a following terminal receipt,
while a fresh completed cursor does not restart.

The focused subset passed: two new recovery tests and all four
`test_publication_protocol_process_crash` boundaries, `6 passed`.

## Recovery correction

The affected file exposed an actual cleanup defect: a cursor exhausted by live
batches could defer a newly terminal crash receipt behind its bounded generic
walk. Recovery now first visits a bounded list of recent, terminal,
UUID-validated attempts from the durable scan-operation table. Each receipt
still goes through the existing manifest parsing, source proof, ownership,
reference, and scan-write-fence checks before anything is deleted. The generic
cursor remains in place for fair incremental work.

## Verification

- `trunk check backend/handler/filesystem/scan_media_recovery.py backend/tests/handler/test_media_recovery_cursor.py` passed.
- The isolated MariaDB target passed both directly affected files:
  `103 passed`.
- This includes the 600-directory cursor budget case, the two new direct
  cursor-decision tests, and all four original process-crash boundaries.
