---
quick_id: 261118-cgg
status: complete
---

# Archive CRC raw fallback summary

- Preserved the input CRC, MD5, and SHA1 objects before archive-member hashing.
  An `ArchiveReadError` now returns that pristine state, so raw-file fallback is
  independent of how many members an extractor emitted.
- Added one focused regression test with one and two emitted members before the
  same simulated read failure. Both runs require the raw archive CRC, MD5, and
  SHA1 and no member inventory.
- Ran only `tests/handler/filesystem/test_archive_crc_recovery.py` in an
  isolated container: 1 passed. Browser inspection of Scan and Library
  management completed at 1440 px and 390 px with no post-login console or
  network failures.
