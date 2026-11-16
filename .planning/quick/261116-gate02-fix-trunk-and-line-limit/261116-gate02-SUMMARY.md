---
quick_id: 261116-gate02
status: complete
completed: 2026-11-16
---

# Quick task summary

Removed the unused `original_crc` binding that the archive integrity failure
path no longer returns. The bounded subprocess-pipe reader now lives in the
focused `backend/utils/archive_streaming.py` module. It still receives the one
archive deadline, waits only until that deadline, terminates and reaps the
exact extractor, then invokes the existing timeout path.

`roms_handler.py` is restored to the 1324 lines of `main`; `archives.py` is
733 lines, equal to its `main` baseline. The new helper is 42 lines and
has one archive-extractor responsibility. The scoped Trunk check was run after
the change; no test or test suite was created or run.
