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

The architecture now records the protected, attempt-scoped scan-result contract and the bounded frontend explorer. Typecheck and a production build pass; the required browser interaction inspection is blocked before the scan panel mounts by an unrelated local application bootstrap error.

## Implemented

- Documented that the scan-operation projection is protected, data-minimized, current-attempt scoped, and separates compact polling from explicit bounded result queries.
- Documented frontend ownership: `Scan.vue` retains scan execution/settings/live-log responsibilities, `OperationStatusPanel` communicates compact authoritative status, and `useScanOperationResults` owns URL state, ordering, and one-page replacement.
- Recorded the closed disclosure invariant: no result rows are fetched until opened, and closing releases the bounded page.

## Verification

- Passed `cd frontend && npm run typecheck`.
- The normal `npm run build` reached PWA generation but could not write into the pre-existing `frontend/dist` directory owned by `nobody`. The identical production build passed with an owned job-temporary `--outDir`: 3,912 modules transformed and PWA precache/service-worker artifacts generated.
- Passed `git diff --check -- docs/FRONTEND_ARCHITECTURE.md docs/BACKEND_ARCHITECTURE.md`.

## Browser Inspection Blocker

An uncommitted one-off Playwright driver in the job temporary directory intercepted only scan-operation GETs and constructed deterministic, current-attempt running and completed snapshots for 1,000 safe rows. It supplied summary-only snapshots unless `include_items=true`, then served only the requested 50-row slice with matching total, platform options, actionable count, and at most three samples. The fixture included `Phase41 Beyond Page Game 0731`.

The browser reached the isolated local frontend and issued the expected summary-only `/api/scan-operations/active` request with zero returned item rows. It could not mount the scan result disclosure because the application then failed in pre-existing global initialization with `TypeError: t.find is not a function` from the production frontend bundle. Earlier temporary Vite serving also returned `504 Outdated Optimize Dep` for its Vue dependency. The production preview avoided that Vite dependency error but still exposed the global initialization failure. No scan form, setting, browser control, viewport/theme sweep, pagination, filter, or beyond-page interaction can honestly be claimed from this environment.

## Tests

No tests, test fixtures, guard tests, pixel checks, or test suites were created or run, per the pre-UAT test lock.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Build environment] Used an owned temporary production output directory.**
- **Issue:** The existing repository `frontend/dist` directory is not writable by the job user, causing Workbox to find no generated assets.
- **Fix:** Built with Vite's supported `--outDir` option in the job temporary directory.
- **Files modified:** None.

### Deferred Issues

**1. [Browser infrastructure] Local global application initialization prevents the required visual interaction proof.**
- **Issue:** `TypeError: t.find is not a function` occurs after authenticated fixture bootstrap and before `Alle Ergebnisse` renders.
- **Impact:** The requested browser interaction matrix remains pending human/UAT or a repaired local app bootstrap.

## Self-Check: PASSED

- Confirmed both updated architecture documents and this summary exist.
- Confirmed the plan made no source or test changes beyond the documented architecture work.
