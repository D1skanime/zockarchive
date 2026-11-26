---
phase: 51-za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l
plan: 02
subsystem: api
tags: [fastapi, igdb, provider-media, owned-media]
requires:
  - phase: 51-01
    provides: Typed provider-media preparation and additive reconciliation outcomes.
provides:
  - Explicit same-ID IGDB assignments retrieve and retain the current provider-media catalog.
  - Provider refresh reports stage-aware 409 conflicts instead of a false successful response.
affects: [rom-metadata, owned-media, v2-refresh-dialog]
tech-stack:
  added: []
  patterns: ["Thin protected endpoint orchestration over typed provider-media outcomes"]
key-files:
  created: []
  modified:
    - backend/endpoints/roms/__init__.py
    - backend/endpoints/roms/media.py
key-decisions:
  - "Only an explicitly supplied unchanged IGDB ID triggers the current-catalog refresh."
  - "The refresh route returns its existing detailed-ROM schema only after a fully successful reconciliation."
patterns-established:
  - "Provider-media failures use a concise stage and candidate 409 detail at the HTTP boundary."
requirements-completed: [MEDIA-51-01, MEDIA-51-05]
duration: 14min
completed: 2026-11-26
---

# Phase 51 Plan 02: Endpoint Media Lifecycle Summary

**Explicit same-ID IGDB assignment now refreshes the retained catalog, while partial provider-media work returns a retryable stage-aware conflict.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-11-26T15:00:00Z
- **Completed:** 2026-11-26T15:14:25Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Same-ID IGDB assignments fetch the known current record, retain only its provider-media inventory, and reuse the normal publisher without replacing other metadata.
- A missing known catalog is an explicit 409 rather than a success-like update response.
- The protected refresh route preserves authorization, visibility, expected-version handling and canonical serialization, while translating lookup, normalization, download, storage and publication failures into stage-aware 409 details.

## Task Commits

1. **Task 1: Route same-ID manual IGDB assignment through current-catalog preparation** - `010687e95` (fix)
2. **Task 2: Translate explicit refresh outcomes at the protected response boundary** - `f2b7d38b9` (fix)

## Files Created/Modified

- `backend/endpoints/roms/__init__.py` - treats an explicitly supplied unchanged IGDB ID as a current provider-media acquisition request.
- `backend/endpoints/roms/media.py` - maps typed preparation and per-item reconciliation outcomes to concise conflict details.

## Decisions Made

- Same-ID behavior is restricted to an explicitly provided non-empty ID, so unrelated ROM edits do not incur a provider lookup.
- A partial batch does not return `DetailedRomSchema`; already persisted siblings remain available through the normal canonical refetch and failed candidates are not suppressed.

## Verification

- Ran the plan-prescribed isolated synthetic harness from `backend/` for same-ID assignment and lookup, network/download, storage, publication-conflict and partial-success refresh cases.
- The harness executed the production refresh route with inert collaborators: lookup, download, storage and publication failures each returned HTTP 409 with a stage-specific detail, while a full success returned the canonical detailed-ROM marker.
- The real Plan 01 metadata helper invocation confirmed live-catalog retention, reusable active-cover no-download, additive missing screenshot download, suppression persistence and retry behavior.
- Parsed both edited Python modules with `compile()` and ran `git diff --check`.
- No repository test suite, browser automation, Docker, provider service, NAS mount, production credential, Trunk, frontend typecheck or build was run, per the phase constraint.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Isolated route import from the application dependency graph**
- **Found during:** Task 2
- **Issue:** Importing the complete ROM router directly hit an existing authentication-module circular import before the route could be exercised.
- **Fix:** Extended the disposable `/tmp/za-phase51-media-runtime-harness` with inert router collaborators and loaded the exact production refresh module for isolated execution.
- **Files modified:** `/tmp/za-phase51-media-runtime-harness/reproduce.py`
- **Verification:** The recorded route outcomes cover lookup, download, storage, publication and full-success paths without external access.
- **Committed in:** Not applicable, temporary evidence only.

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** The disposable harness remains outside the repository; production scope is unchanged.

## Issues Encountered

The first isolated endpoint import reached an existing circular auth import. The temporary harness avoids app startup and evaluates only the protected route behavior with controlled collaborators.

## Known Stubs

None. The only mocks are in the explicitly disposable runtime harness, not application code.

## User Setup Required

None.

## Next Phase Readiness

The frontend dialog can consume the unchanged endpoint contract and surface its returned 409 detail. Phase 51 documentation and broader validation remain with the following wave.

## Self-Check: PASSED

- Found `backend/endpoints/roms/__init__.py` and `backend/endpoints/roms/media.py`.
- Found commits `010687e95` and `f2b7d38b9` in repository history.

*Phase: 51-za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l*
*Completed: 2026-11-26*
