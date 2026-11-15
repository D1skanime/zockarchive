---
phase: 44-za-einrichtungsassistent-ordner-ausschlie-en-und-plattformen
plan: "01"
subsystem: setup, scan, frontend, docker-init
tags: [setup, exclusions, platform-search, ZASelect, docker]
requires:
  - phase: 43
    provides: Current ZA release-workflow baseline
provides:
  - Honest Phase 44 inventory and pre-UAT technical evidence for pre-existing setup and Docker changes
affects: [setup-assistant, scans, docker-init, live-uat]
tech-stack:
  added: []
  patterns:
    - Existing feature commits remain attributed to their original delivery commits when Phase 44 supplies only inventory and verification.
key-files:
  created:
    - .planning/phases/44-za-einrichtungsassistent-ordner-ausschlie-en-und-plattformen/44-01-SUMMARY.md
    - .planning/phases/44-za-einrichtungsassistent-ordner-ausschlie-en-und-plattformen/44-VERIFICATION.md
  modified:
    - .planning/ROADMAP.md
    - .planning/STATE.md
key-decisions:
  - "Do not alter production code without a concrete static contract violation."
  - "Keep browser and scan claims for human UAT because no isolated authentic setup environment was supplied."
patterns-established:
  - "Pre-existing delivery commits are inventoried separately from later GSD phase evidence."
requirements-completed: []
duration: 14min
completed: 2026-11-11
---

# Phase 44 Plan 01: Setup Exclusions and Platform Search Verification Summary

**Phase 44 records the already delivered durable setup exclusions, searchable ZASelect picker, and ZockArchive init branding with non-test pre-UAT evidence.**

## Performance

- **Duration:** 14 min
- **Tasks:** 2 completed
- **Files modified:** 4 planning records

## Accomplishments

- Inventoried `1293dd139` as the durable exclusion model, assignment/recovery reconciliation, API disposition contract, and mapping-only scan boundary.
- Inventoried `9a398b364` as the localized setup-row exclusion action plus searchable, pinned ZASelect interaction; `647f17e37` as the corresponding architecture documentation; and `fb4f1afa8` as the Docker init presentation update.
- Ran only permitted pre-UAT checks. No production defect was demonstrated, so production code was not changed.

## Delivery Inventory

| Commit | Delivered boundary | Static evidence |
| --- | --- | --- |
| `1293dd139` | Unique root-relative `SetupFolderExclusion`, exclusive platform/excluded disposition, recovery, and active-mapping-only scan selection | `storage.py`, `setup_folder_handler.py`, `setup_recovery.py`, setup response/API types |
| `9a398b364` | Visible selected exclusion, translated pinned `Nicht scannen` action, case-insensitive platform filter, pointer and keyboard routes | `SetupStepPlatforms.vue`, `Setup.vue`, `ZASelect.vue`, locale files |
| `647f17e37` | Current backend and frontend architecture descriptions | `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md` |
| `fb4f1afa8` | ZockArchive banner and init log prefix, preserving version command and startup functions | `docker/init_scripts/init` |

## Verification Performed

- `git diff --check` passed before and after phase-record work.
- `git show --stat --oneline 1293dd139 9a398b364 647f17e37 fb4f1afa8` confirmed the original, separate delivery scopes.
- Targeted source inspection confirmed the exclusion model, exclusive disposition validation, recovery state, `searchable`, `pinnedActionLabel`, `pinned-action`, and `SETUP_EXCLUDED` links.
- `bash -n docker/init_scripts/init` passed.
- `npm run typecheck` passed.
- Locale parity and sorted-key checks passed for all locale directories.
- `npm run build -- --outDir /tmp/za-261111-98c5-phase44-vite-build` passed. The build emitted existing non-fatal Lightning CSS `:deep` compatibility notices, a dependency `eval` warning, and chunk-size notices; it exited successfully.

## Production Changes During This Plan

None. Task 1 found no concrete static violation of the locked Phase 44 contract. The listed product commits predate Phase 44 execution and are not re-attributed as work performed by this plan.

## Deviations from Plan

None. The plan explicitly permits no production change when inspection finds no demonstrable defect.

## Tests

No new tests were created and no test suite was started before live UAT.

## Remaining Human UAT

Browser and actual scan evidence are intentionally not claimed: no isolated authentic setup environment was supplied, and no permanent Docker stack was inspected, started, restarted, or modified.

1. In setup step 1, set `Gamevault` and `Gametools` to `Nicht scannen`; verify the selected row label and that Weiter becomes available only after all remaining folders have a platform or exclusion.
2. For a games folder, type `win`, select Windows with pointer input, and repeat selection through keyboard focus and activation. Verify the pinned exclusion action remains above empty filtered results.
3. Reload or revisit setup and confirm both exclusions persist. Select a platform for an excluded row and confirm that it removes the exclusion.
4. Finish setup, run the first scan and a later scan, and verify that `Gamevault` and `Gametools` are not scanned while the Windows folder is considered through its active mapping.
5. Inspect Docker startup output for the ZockArchive banner, `[ZockArchive][init]` prefix, and version line, without changing startup behavior.

## Release Boundary

Merge, push, prerelease creation, GitHub Actions/GHCR inspection, deployment, persistent Docker resources, and filesystem mutation remain deferred until explicit human approval.

## Next Phase Readiness

The branch is ready for the named human UAT. A later approval-gated release workflow must use the accepted tested commit and must not treat this pre-UAT record as merge or publication authorization.

## Self-Check: PASSED

- The summary and verification files exist.
- The original product commits are present in history.
