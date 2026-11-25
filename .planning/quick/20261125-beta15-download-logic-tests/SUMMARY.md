---
id: 20261125-beta15-download-logic-tests
status: complete
date: 2026-11-25
---

# Accepted download logic tests

Added direct response and predicate coverage for a legacy PS3 ISO whose sole
persisted `RomFile` uses `file_path == "."`. The tests assert the source is
preparable as `file`, while a mismatched filename remains rejected.

Verification: focused isolated test module
`tests/endpoints/responses/test_folder_download.py`, 13 passed. No production
files changed.
