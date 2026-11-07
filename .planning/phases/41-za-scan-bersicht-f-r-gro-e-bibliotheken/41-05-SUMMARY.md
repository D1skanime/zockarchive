---
phase: 41-za-scan-bersicht-f-r-gro-e-bibliotheken
plan: 05
subsystem: scan architecture and pre-UAT validation
tags: [scan, documentation, typecheck, build, browser-inspection]
requires: [41-04]
provides: [documented-bounded-scan-contract, pre-uat-validation-receipt]
affects: [frontend-architecture, backend-architecture, scan-operation-overview]
tech_stack: [Vue, Vite, Playwright]
key_files:
  created: []
  modified:
    - docs/FRONTEND_ARCHITECTURE.md
    - docs/BACKEND_ARCHITECTURE.md
decisions:
  - The scan result explorer owns URL-backed server queries and replaces its sole rendered page.
  - Lifecycle polling remains summary-only and the closed disclosure owns detail fetching.
metrics:
  tasks_completed: 2
  tests_run: 0
---

# Phase 41 Plan 05: Scan Architecture and Pre-UAT Validation Summary

The architecture now records the protected, attempt-scoped scan-result contract and the bounded frontend explorer. Typecheck and a production build pass; the required browser interaction inspection passed with controlled 1,000-game running and completed snapshots.

## Implemented

- Documented that the scan-operation projection is protected, data-minimized, current-attempt scoped, and separates compact polling from explicit bounded result queries.
- Documented frontend ownership: `Scan.vue` retains scan execution/settings/live-log responsibilities, `OperationStatusPanel` communicates compact authoritative status, and `useScanOperationResults` owns URL state, ordering, and one-page replacement.
- Recorded the closed disclosure invariant: no result rows are fetched until opened, and closing releases the bounded page.

## Verification

- Passed `cd frontend && npm run typecheck`.
- The normal `npm run build` reached PWA generation but could not write into the pre-existing `frontend/dist` directory owned by `nobody`. The identical production build passed with an owned job-temporary `--outDir`: 3,912 modules transformed and PWA precache/service-worker artifacts generated.
- Passed `git diff --check -- docs/FRONTEND_ARCHITECTURE.md docs/BACKEND_ARCHITECTURE.md`.

## Browser Inspection

An uncommitted one-off Playwright driver used a disposable local production preview and deterministic, current-attempt running and completed snapshots with 1,000 safe rows. The scan-operation route returned summary-only payloads until `include_items=true`; detail responses were server-bounded to `items.slice(offset, offset + 50)`. The fixture included `Phase41 Beyond Page Game 0731`. The supporting global bootstrap fixture returned `[]` for `/api/collections`, the production response shape required by `fetchCollections()`.

- Running: the compact panel showed `417 von 1000 Spielen geprüft`, `Aktuelle Plattform: PlayStation 2`, clearly labelled `Scan insgesamt`, and 102 actionable cases with exactly three examples and the filtered-details entry point.
- Completed: the compact panel showed `Mit Warnungen abgeschlossen`, `Scan mit Hinweisen abgeschlossen`, `Scan insgesamt`, 1,000 games, and the same bounded action-required summary.
- Before opening `Alle Ergebnisse`, the request log had zero detail requests and the DOM had zero detail rows. Opening made one 50-row request. Paging changed the offset from 0 to 50 while the DOM remained at 50 rows.
- Search found `Phase41 Beyond Page Game 0731` beyond page one. Combined Windows plus `Handlungsbedarf` filtering returned 32 rows and sent both server filters.
- Closing released all rendered detail rows. Reopening made a fresh bounded page request.
- The result disclosure remained visible with bounded rows at 320, 600, 960, 1280, and 1920px in dark and light themes for both running and completed snapshots. Existing scan controls and settings were not changed.

The initially occupied local ports 4173 and 4174 were left untouched. Port 4173 returned `504 Outdated Optimize Dep`, so the inspection used a separate temporary production preview on port 4180. This was browser infrastructure only, not a product behavior issue.

## Tests

No tests, test fixtures, guard tests, pixel checks, or test suites were created or run, per the pre-UAT test lock.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Build environment] Used an owned temporary production output directory.**
- **Issue:** The existing repository `frontend/dist` directory is not writable by the job user, causing Workbox to find no generated assets.
- **Fix:** Built with Vite's supported `--outDir` option in the job temporary directory.
- **Files modified:** None.

None - the controlled browser inspection completed after correcting the temporary collection-list fixture.

## Self-Check: PASSED

- Confirmed both updated architecture documents and this summary exist.
- Confirmed the plan made no source or test changes beyond the documented architecture work.
