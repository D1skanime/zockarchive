---
phase: 41-za-scan-bersicht-f-r-gro-e-bibliotheken
plan: 01
subsystem: durable scan operations
tags: [scan, pagination, openapi, worker-lifecycle]
requires: []
provides: [compact-scan-snapshot, attempt-scoped-result-query]
affects: [scan-operation-api, scan-worker, generated-frontend-contract]
tech_stack: [FastAPI, Pydantic, SQLAlchemy, OpenAPI]
key_files:
  created:
    - frontend/src/__generated__/models/ScanOperationPlatform.ts
    - frontend/src/__generated__/models/ScanOperationResultQuery.ts
    - frontend/src/__generated__/models/ScanOperationTotals.ts
  modified:
    - backend/endpoints/responses/scan_operations.py
    - backend/handler/scan_operation_projection.py
    - backend/handler/scan_operation_worker.py
    - backend/endpoints/sockets/scan.py
decisions:
  - Status snapshots are row-free unless include_items is explicitly requested.
  - Active-platform facts are worker-fenced checkpoint data and are only public for the matching running attempt.
metrics:
  tasks_completed: 3
  tests_run: 0
---

# Phase 41 Plan 01: Bounded Scan Snapshot Contract Summary

The durable scan-operation endpoint now returns compact, attempt-scoped scan facts and only returns a bounded result page on an explicit request.

## Implemented

- Added validated result-query inputs for explicit page retrieval, offset, limit, normalized name search, numeric platform filtering and allow-listed result outcomes.
- Reworked the operation projection so rows, matching count, platform options, aggregate totals and actionable samples share the current-attempt boundary. Actionable samples are capped at three safe display records.
- Removed raw operation checkpoint data from the public snapshot. Added safe platform, result-classification, totals, query, actionable and active-platform descriptors.
- Persisted the active platform through the existing worker write fence before the presentation socket event. Terminal, cancellation, interruption, recovery and resume paths clear the active-platform checkpoint fact.
- Regenerated the checked-in OpenAPI transport types from a temporary local OpenAPI contract. The configured local API endpoint was unavailable, so no service was started or altered.

## Verification

- Passed targeted Python syntax compilation for every touched backend module with a temporary bytecode cache.
- Passed `git diff --check`.
- Confirmed the generated OpenAPI route exposes the bounded explorer inputs and generated model types.

## Not Run

- No tests or test suites were added, changed or run, per the pre-UAT test lock.
- Frontend typecheck, production build and browser inspection are intentionally deferred to Plan 05.
- A direct `ruff format` command could not run because the backend environment has no `ruff` executable. The repository commit hook subsequently formatted the changed Python files and reported no issues; no dependency was installed.

## Deviations from Plan

The repository generation script requires a backend at `127.0.0.1:3344`, which was unavailable. An ephemeral local FastAPI OpenAPI export, using the same repository generator arguments, produced the required generated types without starting or changing a service.
