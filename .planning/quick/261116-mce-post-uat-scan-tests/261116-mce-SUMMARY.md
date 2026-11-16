---
quick_id: 261116-mce
status: complete
completed: 2026-11-16
---

# Quick task summary

Added a direct worker regression test for `ArchiveReadError`: it must preserve
the terminal `failed`, `archive_evidence_incomplete`, `new_scan` outcome.
The existing direct mixed-scan test already verifies that a mapped archive
failure still invokes the legacy Windows, Wii, and Xbox path before re-raising.

Both affected isolated MariaDB CI shards passed: shard 6 covers
`tests/endpoints/sockets/test_scan.py`; shard 8 covers
`tests/tasks/test_scan_operation_worker.py`. No product source file changed.
