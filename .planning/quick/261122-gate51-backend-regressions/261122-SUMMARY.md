---
quick_id: 261122-gate51-backend-regressions
title: Repair Gate 51 backend regression failures
status: complete
completed: 2026-11-22
---

# Result

The IGDB endpoint contract test now isolates the endpoint's metadata update
boundary from owned-media publication. It still verifies that the IGDB match is
accepted and that the transient artwork URL is not written as a ROM field, while
the separately covered publisher remains responsible for HTTP image retrieval.

## Diagnosis

- The IGDB failure was real test isolation drift: the manual-match endpoint now
  deliberately invokes `rom_media.publish_igdb`, so the old endpoint test made
  a live request to `images.igdb.com`. The test now substitutes that downstream
  publisher and asserts that it was reached.
- The two process-crash media-recovery cases, the compound tar reader case, and
  both RetroAchievements progress cases passed unchanged in a fresh disposable
  `pgdp-ci` target, both as the six-case selection and, for the media and task
  modules, in their direct module context. No product regression could be
  reproduced, so no speculative change to recovery, archive integrity, or
  scheduled synchronization was made.
- Gate 51's `20 instead of 10` skip report double-counts failed shard summaries.
  The raw log contains only three distinct shard outcomes with skips, 7, 1, and
  2. Each occurs once as the pytest summary and once in the runner's repeated
  exception tail, giving 20 to a parser that sums every matching line. A green
  shard has one summary, so no skip baseline or runner behavior was changed.

## Verification

- Disposable MariaDB `pgdp-ci` selection of all six reported failure keys:
  **8 passed** (the process-crash parametrization covers prepared, streamed,
  published, and committed boundaries).
- Disposable MariaDB direct affected modules:
  `test_scan_media_publication.py` and
  `test_sync_retroachievements_progress.py`, **108 passed**.
- `trunk check backend/tests/endpoints/roms/test_rom.py` passed.
- Every disposable run completed its cleanup and source-immutability check.

## Documentation

No runtime responsibility changed. The existing backend architecture already
describes retained IGDB media and the suppression-aware publisher, so this
test-boundary correction needs no architecture-document update.
