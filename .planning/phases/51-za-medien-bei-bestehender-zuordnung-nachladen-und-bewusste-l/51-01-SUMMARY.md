---
phase: 51-za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l
plan: 01
subsystem: backend metadata and owned media
tags: [python, sqlalchemy, igdb, provider-media, owned-media]
requires:
  - phase: existing provider-media suppression
    provides: stable candidate identity and locked tombstone enforcement
provides:
  - Explicit IGDB refresh always persists the confirmed current media snapshot.
  - Generic provider reconciliation reuses active owned paths before download.
  - Failure outcomes retain preparation, download, storage, and publication stages.
affects: [51-02, media-refresh, manual-igdb-assignment]
tech-stack:
  added: []
  patterns: [current snapshot then additive publication, stable active-path reuse]
key-files:
  created: []
  modified:
    - backend/handler/metadata/rom_media.py
    - backend/handler/database/roms_handler.py
key-decisions:
  - "A confirmed empty live catalog replaces the retained provider snapshot but never retires catalog rows."
  - "Only an active provider row with the same candidate key, role, and owned path is reusable."
patterns-established:
  - "Provider media: suppress before I/O, reuse active paths, then retain locked reconciliation."
requirements-completed: [MEDIA-51-02, MEDIA-51-03, MEDIA-51-04, MEDIA-51-05]
duration: 8min
completed: 2026-11-26
---

# Phase 51 Plan 01: Provider-owned media lifecycle Summary

**Explicit IGDB refresh now persists the live catalog, imports only missing eligible media, and preserves active paths plus durable operator intent.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-11-26T15:00:00Z
- **Completed:** 2026-11-26T15:07:45Z
- **Tasks:** 2/2
- **Files modified:** 2 repository files, plus an untracked temporary harness

## Accomplishments

- Captured the retained same-ID and stale-partial-catalog behavior with a disposable synthetic runtime harness under `/tmp/za-phase51-media-runtime-harness/`.
- Changed explicit IGDB preparation to fetch and retain the current known-ID snapshot, including a confirmed empty snapshot, without retiring media or user-controlled state.
- Added a provider-qualified active inventory lookup so generic reconciliation skips network and storage work for a reusable active path while preserving suppression and the locked publication check.
- Preserved stage-specific lookup, normalization, download, storage, and publication outcomes for the later route-level response work.

## Task Commits

1. **Task 1: Capture the legacy same-ID and partial-catalog failure in an isolated runtime harness** - temporary evidence only, no repository commit
2. **Task 2: Implement current-catalog preparation and idempotent generic reconciliation** - `2445a2f33` (fix)

## Files Created/Modified

- `backend/handler/metadata/rom_media.py` - current IGDB catalog preparation, stage-aware failures, and reusable active-media checks.
- `backend/handler/database/roms_handler.py` - focused provider-qualified active owned-media inventory query.

## Verification

- Ran `cd backend && uv run python /tmp/za-phase51-media-runtime-harness/reproduce.py --record /tmp/za-phase51-media-runtime-harness/before.json` before implementation.
- Ran `cd backend && uv run python /tmp/za-phase51-media-runtime-harness/reproduce.py --implementation-check --record /tmp/za-phase51-media-runtime-harness/after-handler.json` after implementation.
- The sanitized after receipt records a live two-candidate catalog, no repeat download for the reusable active cover, and one additive download for the missing screenshot. It also records empty-catalog no-retirement, suppression, retry, lookup, network, storage, publication-conflict, and manual-state scenarios.
- No repository tests or test suites, browser automation, Docker, provider service, NAS mount, production credentials, Trunk gate, frontend typecheck, or build gate were run.

## Decisions Made

- A provider lookup that does not confirm the known IGDB ID raises a typed lookup failure and leaves the retained snapshot unchanged.
- Active path reuse is optimistic only. The existing locked reconciliation still owns the final suppression and expected-version check.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Isolated the real-handler harness from backend runtime configuration**
- **Found during:** Task 2
- **Issue:** Importing the backend handler required an auth key and attempted to create its config below the unavailable container path.
- **Fix:** The untracked harness supplies a deterministic synthetic auth value and `/tmp` base path before imports. It uses only mocked provider, database, filesystem, and storage collaborators.
- **Files modified:** `/tmp/za-phase51-media-runtime-harness/reproduce.py`
- **Verification:** The implementation receipt completed with `external_access: false` and a real helper invocation.
- **Committed in:** Not applicable, temporary evidence only.

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** The harness remains disposable and isolated; repository scope is unchanged.

## Issues Encountered

The harness initially ran from the repository root instead of `backend`, so the Python module path did not contain `handler`. Re-running the plan-prescribed `cd backend` command completed successfully.

## Known Stubs

None. The temporary harness is intentionally synthetic and is not application code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 51-02 can connect the typed outcomes to same-ID assignment and the existing 409 response contract.
- Plan 51-03 can await the existing v2 refresh request without adding a second client path.
- The deferred Trunk, typecheck, and build gates remain assigned to Wave 3.

## Self-Check: PASSED

- Found both modified handler files and the summary.
- Found task commit `2445a2f33` in repository history.

*Phase: 51-za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l*
*Completed: 2026-11-26*
