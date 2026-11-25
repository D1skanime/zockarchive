---
id: 20261125-beta15-shared-builder-tests
status: complete
date: 2026-11-25
---

# Shared download builder logic tests

Added direct unit tests for the shared download builder dispatch. A legacy PS3
ISO persisted with `file_path == "."` invokes the single-file verifier, while
a folder ROM invokes the folder verifier with no fabricated inventory.

Verification: focused, guarded isolated backend run of
`tests/handler/filesystem/test_folder_download.py` and
`tests/endpoints/responses/test_folder_download.py` passed. Trunk formatting
and checks passed for both test modules. No production files changed.
