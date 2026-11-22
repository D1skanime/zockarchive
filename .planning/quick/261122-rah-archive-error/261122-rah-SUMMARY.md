---
quick_id: 261122-rah
title: Contain RAHasher archive inventory failures
status: complete
---

# RAHasher archive inventory containment

## Result

The review finding was confirmed. `extract_largest_archive_member` correctly
raises `ArchiveReadError` for incomplete member evidence, but RAHasher did not
contain that optional-hash failure. `RAHasherService` now returns no RA hash for
only that ROM and logs the incomplete inventory; the platform scan continues.

The archive helper contract now explicitly distinguishes ordinary extraction
failure (`None`) from incomplete member evidence (`ArchiveReadError`).

## Verification

- `trunk check backend/adapters/services/rahasher.py backend/utils/archives.py` passed.
- The two changed modules compiled with `PYTHONPYCACHEPREFIX` in the job
  temporary directory; the repository's standard cache path is not writable.
- Browser inspection after form login opened `/scan`, operated the scan-type
  control, and reported no post-login console or network errors. Screenshot:
  `screens/review-rahasher-archive-containment.png`.

No test suite was run, as required before Live-UAT.
