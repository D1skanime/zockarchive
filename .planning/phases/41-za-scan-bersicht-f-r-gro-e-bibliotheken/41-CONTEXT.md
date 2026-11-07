# Phase 41: ZA Scan Overview for Large Libraries - Context

**Gathered:** 2026-11-07
**Status:** Ready for planning
**Mode:** Autonomous, user requirements supplied with the job

<domain>
## Phase Boundary

Improve the active v2 `/scan` operation overview for large libraries. It must make reliable running progress and the current platform understandable, show a compact final result, surface actionable outcomes, and fetch filtered result pages only when requested. Existing scan execution and settings behavior are out of scope for change.
</domain>

<decisions>
## Implementation Decisions

### Running and completed scan communication
- Present progress and the current platform during a run only when the operation snapshot contains trustworthy data; never infer a platform from stale or incomplete rows.
- Label the scan total and Windows file-inventory check as separate concepts in localized copy.
- On completion, lead with one compact result summary rather than an expanded item list.
- Replace English fallback copy and ambiguous operation-status labels in this area with understandable localized labels.

### Actionable results and bounded detail
- Keep unidentified games, errors, and analogous action-required outcomes visible near the summary.
- For large counts, show the total and only a small representative sample, with a control that opens the matching filtered details.
- Keep “all results” closed initially and do not preload it.

### Whole-operation navigation
- Load result items on demand through the existing paged operation endpoint and bound the displayed page after every navigation.
- Search by game name and filter by platform and result across the complete scan operation, not only already-loaded browser rows.
- Reuse existing pagination and UI primitives. URL-backed state is preferred where it matches established v2 session-filter patterns.

### Delivery and validation
- Retain existing scan execution and settings behavior.
- Validate with synthetic running and completed 1,000-game operation data, including a game beyond page one, desktop and mobile interaction.
- Before human UAT, use typecheck, production build, and hands-on browser inspection only. Do not add tests or run test suites.

### the agent's Discretion
- Select the minimum backend contract extension, composable boundaries, page size, and exact representative-item count needed to satisfy the approved behavior while preserving existing ownership and operation lifecycle semantics.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useScanOperationStatus` already restores an operation, polls it, and fetches status pages with an offset and a maximum limit of 100.
- `OperationStatusPanel`, `InventoryStatusSummary`, `InventoryStatusDetail`, and `ScanLiveHeader` already render operation state through v2 primitives.
- `scanOperations.status(id, offset, limit)` is the typed operation adapter boundary.

### Established Patterns
- `/scan` is a v2 route, uses `useLibraryOperation` for the scan lifecycle, and gets live server updates through the single Socket.IO service.
- v2 features use localized copy, URL state for bookmarkable filters, `useBreakpoint`/HTML data attributes for responsive layout, and `ZA*` primitives for controls.
- Operation data is backend-authoritative; frontend projections must tolerate transport uncertainty and stale snapshots.

### Integration Points
- `frontend/src/v2/views/Scan.vue` owns the route composition.
- `frontend/src/v2/components/Scan/OperationStatusPanel.vue` is the existing operation overview surface.
- Backend scan-operation response/projection code owns complete-operation filtering and pagination contracts.
- `docs/FRONTEND_ARCHITECTURE.md` documents scan data flow and must remain aligned with any new reusable scan-result boundary.
</code_context>

<specifics>
## Specific Ideas

Use the requested synthetic 1,000-game scenarios as browser fixtures or controlled data at inspection time. The key proof is no open mass list and no up-front transfer of every item.
</specifics>

<deferred>
## Deferred Ideas

None, discussion stayed within the approved scan overview scope.
</deferred>
