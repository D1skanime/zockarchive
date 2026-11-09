# Phase 41: ZA Scan Overview for Large Libraries - Research

**Researched:** 2026-11-07
**Domain:** Durable scan-operation projection, v2 operation UI, server-side result exploration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Present progress and the current platform during a run only when the operation snapshot contains trustworthy data; never infer a platform from stale or incomplete rows.
- Label the scan total and Windows file-inventory check as separate concepts in localized copy.
- On completion, lead with one compact result summary rather than an expanded item list.
- Replace English fallback copy and ambiguous operation-status labels in this area with understandable localized labels.
- Keep unidentified games, errors, and analogous action-required outcomes visible near the summary.
- For large counts, show the total and only a small representative sample, with a control that opens the matching filtered details.
- Keep “all results” closed initially and do not preload it.
- Load result items on demand through the existing paged operation endpoint and bound the displayed page after every navigation.
- Search by game name and filter by platform and result across the complete scan operation, not only already-loaded browser rows.
- Reuse existing pagination and UI primitives. URL-backed state is preferred where it matches established v2 session-filter patterns.
- Retain existing scan execution and settings behavior.
- Validate with synthetic running and completed 1,000-game operation data, including a game beyond page one, desktop and mobile interaction.
- Before human UAT, use typecheck, production build, and hands-on browser inspection only. Do not add tests or run test suites.

### the agent's Discretion

- Select the minimum backend contract extension, composable boundaries, page size, and exact representative-item count needed to satisfy the approved behavior while preserving existing ownership and operation lifecycle semantics.

### Deferred Ideas (OUT OF SCOPE)

None, discussion stayed within the approved scan overview scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
| --- | --- | --- |
| ZA-SCAN-41-01 | Truthful running progress, current platform and compact final summary | Attempt/version-safe snapshot projection and display-fact mapper |
| ZA-SCAN-41-02 | Separate scan and Windows inventory concepts, localized copy | Existing scan stats plus inventory aggregate contract and all-locale `scan` keys |
| ZA-SCAN-41-03 | Prominent bounded actionable cases | Server count/sample projection and outcome-filter deep link |
| ZA-SCAN-41-04 | Closed, on-demand bounded details | One-page result composable, disclosure and existing controls |
| ZA-SCAN-41-05 | Full-operation search and filters | Indexed server query over the current operation attempt, URL query state |
| ZA-SCAN-41-06 | 1,000-game desktop/mobile validation without tests | Synthetic browser fixture route or controlled adapter response, typecheck, build and manual inspection |
</phase_requirements>

## Summary

The durable scan API already has the right ownership boundary: `GET /scan-operations/{id}` returns one current-attempt page, an offset and the matching total. It is currently only an unfiltered `ScanOperationItem` query, and `useScanOperationStatus` merges every fetched page into one browser array. That accumulation directly conflicts with the large-library requirement. [VERIFIED: codebase `backend/handler/scan_operation_projection.py`, `frontend/src/v2/composables/useScanOperationStatus/index.ts`]

The smallest safe change is to extend that existing status endpoint and typed adapter with a result query, not to add a parallel result API. The server must constrain all reads to `(operation_id, current attempt_id)`, apply validated name/platform/outcome predicates before counting and paging, return only the current page, and return a compact aggregate/actionable sample in the same authoritative snapshot. The client must retain the established attempt/version ordering guard, discard stale result responses and never derive a current platform from the live log. [VERIFIED: codebase `backend/endpoints/scan_operations.py`, `backend/handler/database/scan_operations_handler.py`, `backend/handler/scan_operation_projection.py`, `frontend/src/v2/composables/useScanLifecycle/index.ts`]

**Primary recommendation:** Deliver this in five plans: backend contract and indexed projection, typed adapter/current-page composable, compact status/actionable UI, localized responsive result explorer, then documentation plus typecheck/build/browser inspection.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
| --- | --- | --- | --- |
| Operation-wide paging, search, platform and outcome filtering | API / Backend | Database / Storage | Only the durable operation rows can correctly cover all 1,000 results and count them before the page is selected. [VERIFIED: codebase `backend/handler/scan_operation_projection.py`] |
| Current attempt, version and current-platform truth | API / Backend | Browser / Client | The operation record owns attempt/version. Socket platform events are live presentation input and are not stored in the current snapshot. [VERIFIED: codebase `backend/models/scan_operation.py`, `frontend/src/v2/composables/useScanLifecycle/index.ts`] |
| Query URL, request cancellation/order and one rendered page | Browser / Client | API / Backend | The route owns bookmarkable session state while the backend remains the query authority. [VERIFIED: codebase `frontend/src/v2/composables/useTileSearchUrl/index.ts`, `frontend/src/v2/data/adapters/scanOperations.ts`] |
| Compact summary, action-required samples and disclosure | Browser / Client | API / Backend | The frontend presents server-authoritative counts/samples through existing v2 composites and primitives. [VERIFIED: codebase `frontend/src/v2/components/Scan/OperationStatusPanel.vue`, `frontend/src/v2/components/Scan/InventoryStatusSummary.vue`] |
| Localization and architecture documentation | Browser / Client | Documentation | User-visible v2 copy belongs in all locale `scan.json` files; scan data flow is documented in frontend architecture documentation. [VERIFIED: codebase `.claude/skills/frontend-i18n/SKILL.md`, `docs/FRONTEND_ARCHITECTURE.md`] |

## Existing Integration Surfaces

| Surface | Current behavior | Required Phase 41 integration |
| --- | --- | --- |
| `backend/endpoints/scan_operations.py` | `by_id` validates `offset` 0..1,000,000 and `limit` 1..100, then delegates to the durable handler. [VERIFIED: codebase] | Add bounded, validated query parameters for normalized name search, platform identifier and supported result/outcome filter. Keep authorization and route ownership unchanged. |
| `backend/handler/scan_operation_projection.py` | Selects current-attempt items ordered by ID, then separately counts all current-attempt items. [VERIFIED: codebase] | Build one reusable filtered-current-attempt predicate for row select, total count, actionable aggregates/sample and platform option aggregation. Do not query or expose prior attempts. |
| `ScanOperationItem` and storage mapping | Item rows retain `mapping_id`, safe relative path, provider, outcome and checkpoint facts. `PlatformStorageMapping` has indexed `platform_id`. [VERIFIED: codebase `backend/models/scan_operation.py`, `backend/models/storage.py`] | Join mapping and platform for a safe platform id/display field and server-side platform predicate. Do not infer platform from a path or send storage-root paths. |
| Snapshot response and generated frontend type | Snapshot exposes only page items, offset and total. Item rows omit a platform field and no query metadata/actionable sample exists. [VERIFIED: codebase `backend/endpoints/responses/scan_operations.py`, `frontend/src/__generated__/models/ScanOperationSnapshot.ts`] | Extend Pydantic response schema first, regenerate `frontend/src/__generated__`, then extend the v2 adapter contract. |
| `scanOperations.status` | Validates client offsets/limits and sends only offset/limit. [VERIFIED: codebase `frontend/src/v2/data/adapters/scanOperations.ts`] | Replace positional page API with a typed query object containing fixed page size 50, name, platform and outcome. Preserve session/identity validation. |
| `useScanOperationStatus` | Protects operation snapshots by id, attempt, version and timestamp but deduplicates and accumulates fetched pages. [VERIFIED: codebase] | Preserve snapshot reconciliation guard; move explorer state into a focused composable that atomically replaces its single page. Snapshot polling must request summary-only or page-zero metadata without reopening details. |
| `OperationStatusPanel` and inventory composites | The panel calculates a progress ratio and the summary renders every loaded item plus a load-more button. [VERIFIED: codebase] | Keep recovery controls and progress anchor. Extract compact summary, action-required block and result disclosure so the panel does not grow beyond the 500-line policy. |
| `Scan.vue` and live scan lifecycle | `/scan` composes the panel, settings/start form and live platform log. The lifecycle receives `scan:scanning_platform` socket events and can synthesize log entries after dropped events. [VERIFIED: codebase] | Do not change scan submission, settings, Socket.IO lifecycle or log. A platform display is allowed only from a persisted, attempt-scoped snapshot field, not from `scanningPlatforms`. |

## Contract Gaps and Required Server Contract

1. **No durable current-platform field.** `scan:scanning_platform` is a socket event that populates a view log, while `ScanOperationSnapshot` only has generic `checkpoint` data. It cannot prove that a displayed log entry still belongs to the current attempt. Persist and expose an optional `active_platform` only through the worker-owned, write-fenced operation update. It must include the attempt identity or be cleared when the attempt/state changes. The UI omits the label when the field is absent, mismatched, terminal or not explicitly active. [VERIFIED: codebase `frontend/src/v2/composables/useScanLifecycle/index.ts`, `backend/handler/database/scan_operation_lifecycle.py`, `backend/endpoints/responses/scan_operations.py`]

2. **No filterable platform on an item.** Result rows carry `mapping_id`, but the public response does not carry platform id/name. Join `PlatformStorageMapping` and `Platform`, expose a minimal safe platform descriptor, and filter by numeric platform id. This avoids ambiguous relative-path inference and preserves storage privacy. [VERIFIED: codebase `backend/models/scan_operation.py`, `backend/models/storage.py`, `backend/endpoints/responses/scan_operations.py`]

3. **No result classification contract.** Raw `outcome` alone does not cover unrecognized Windows games, inventory-incomplete rows and provider failures, whose facts live in `checkpoint`. Define a small allow-listed explorer outcome vocabulary in the projection, such as `all`, `action-required`, `unidentified`, `failed`, `warning`, `completed`, `skipped`. Filter using the same projection predicate used for its count and representative sample. Do not send raw checkpoint or provider exceptions to the browser. [VERIFIED: codebase `backend/handler/scan_inventory_status.py`, `backend/endpoints/responses/scan_operations.py`; classification names are a plan decision, not an existing API contract.]

4. **No completion summary/actionable sample contract.** Existing inventory counts are SQL aggregates without an unbounded list, but the only sample is the arbitrary current page. Add compact count fields and at most three representative, safe row projections keyed to the current attempt and query-independent actionable predicate. [VERIFIED: codebase `backend/handler/scan_inventory_status.py`, `backend/handler/scan_operation_projection.py`]

5. **Current polling eagerly returns 100 rows.** Restore, active and normal refresh call `status` with its default page. Add a summary-only mode or guarantee that no rows are returned until the disclosure asks for a page. This is required to meet the no-preload constraint; merely hiding the current array is insufficient. [VERIFIED: codebase `frontend/src/v2/data/adapters/scanOperations.ts`, `frontend/src/v2/composables/useScanOperationStatus/index.ts`]

## Pagination and Filter Safety

- Use a fixed page size of 50, as specified by the UI contract. The adapter rejects invalid pages/query values before sending, and the API retains hard limits for offset/limit and query length. [CITED: Phase UI contract `41-UI-SPEC.md`; VERIFIED: codebase `backend/endpoints/scan_operations.py`]
- Translate a page number to offset only in the typed adapter or result composable. Never append pages. On a successful request, replace `items`, `total`, offset/page metadata and loading state as one current-page state. On failure, retain the previous bounded page and offer retry. [CITED: Phase UI contract `41-UI-SPEC.md`; VERIFIED: codebase `useScanOperationStatus` currently accumulates items]
- Reset page to 1 whenever search, platform or outcome changes. Debounce only the name input; filters and pagination issue direct server requests. URL changes use `router.replace`, preserve unrelated query values and guard route-to-ref/ref-to-route loops, matching `useTileSearchUrl`. [VERIFIED: codebase `frontend/src/v2/composables/useTileSearchUrl/index.ts`]
- Assign each explorer request a local sequence or `AbortController`. Accept a response only when its operation id, attempt id, normalized query and sequence still match current state. The existing snapshot’s version/timestamp guard remains responsible for lifecycle reconciliation. [VERIFIED: codebase `frontend/src/v2/composables/useScanOperationStatus/index.ts`; local cancellation mechanism is a recommended implementation detail.]
- Every server query, count, sample and platform-option set must include operation id and current attempt id. This prevents stale prior-attempt rows after resume/retry and makes search/filter totals semantically consistent. [VERIFIED: codebase `backend/handler/scan_operation_projection.py`, `backend/handler/database/scan_operations_handler.py`]
- Keep the existing ownership check in `get_by_id`, parameterized SQLAlchemy expressions and Pydantic query/schema validation. Search must not become a client-side `includes` over fetched rows or raw SQL. [VERIFIED: codebase `backend/handler/database/scan_operations_handler.py`, `backend/endpoints/responses/scan_operations.py`]

## Localization and Documentation Consequences

- All visible changed copy belongs under the `scan` namespace in `en_US` plus all 17 peer locale files. Existing English labels such as `Accepted`, `Queued`, `Completed` and `Metadata warnings` must not be used as fallback copy on this surface. Preserve placeholder names across locales and sort locale JSON as required by repository tooling. [VERIFIED: codebase `frontend/src/locales/en_US/scan.json`, `.claude/skills/frontend-i18n/SKILL.md`]
- Add copy for trustworthy/unknown progress, current platform, scan total, Windows file inventory, compact terminal states, action-required counts/samples, disclosure, remote search, platform/outcome filters, pagination context, empty/loading/error and retry states. Use plural-aware counts. [CITED: Phase UI contract `41-UI-SPEC.md`]
- Update `docs/FRONTEND_ARCHITECTURE.md` so it names the extracted result-query boundary, URL-backed query state, one-page replacement invariant and server-authoritative scan result flow. Update backend architecture documentation if the endpoint response/query contract is changed. [VERIFIED: codebase `CLAUDE.md`, `docs/FRONTEND_ARCHITECTURE.md`]

## Common Pitfalls

### Accidental eager loading

`status(id)` currently defaults to 100 rows and `accept()` appends later pages. Keeping either behavior means polling or a few navigations still construct a browser-side mass list. Require explicit summary-only retrieval and a replace-only page state. [VERIFIED: codebase `frontend/src/v2/data/adapters/scanOperations.ts`, `frontend/src/v2/composables/useScanOperationStatus/index.ts`]

### Misleading current platform

The live log is deliberately repaired from dropped socket ROM events, so its top entry is presentation state, not authoritative operation state. Do not use it for the new current-platform label. [VERIFIED: codebase `frontend/src/v2/composables/useScanLifecycle/index.ts`]

### Filter/count disagreement

Applying filters after pagination produces partial totals and makes a game beyond page one undiscoverable. Build predicates once in the backend and reuse them for list, count and actionable deep links. [VERIFIED: codebase `backend/handler/scan_operation_projection.py`]

### Attempt leakage after retry

The model stores a new `attempt_id` on resume and the projection already scopes rows to it. Any new join/aggregate/query must preserve that scope. [VERIFIED: codebase `backend/handler/database/scan_operations_handler.py`, `backend/handler/scan_operation_projection.py`]

### UI regressions from an oversized panel

`OperationStatusPanel.vue` already combines lifecycle actions, selection/focus recovery, progress and summary. Extend it by composition, not a new monolith; production files must remain below 500 logical lines unless a documented review says otherwise. [VERIFIED: codebase `frontend/src/v2/components/Scan/OperationStatusPanel.vue`, `CLAUDE.md`]

## Standard Stack and Boundaries

No new package is required. Use existing FastAPI, Pydantic, SQLAlchemy, generated OpenAPI types, Vue 3, Vue Router, vue-i18n and ZA primitives. [VERIFIED: codebase `CLAUDE.md`, `backend/endpoints/scan_operations.py`, `frontend/package.json`]

Do not hand-roll a second socket, virtual list, custom URL store, raw Vuetify control, client-side full-operation filter, or a separate scan-result endpoint. The phase should extend the authoritative scan-operation projection and use existing v2 primitive/composable patterns. [VERIFIED: codebase `.claude/skills/frontend-v2-components/SKILL.md`, `.claude/skills/frontend-v2-patterns/SKILL.md`]

## Security Domain

| Area | Required control |
| --- | --- |
| Authorization | Keep `Scope.TASKS_RUN` protection and actor/admin ownership validation for every status query. [VERIFIED: codebase `backend/endpoints/scan_operations.py`, `backend/handler/database/scan_operations_handler.py`] |
| Input validation | Bounded Pydantic/FastAPI query fields, allow-listed outcome values, numeric platform identifiers and capped search length. [VERIFIED: existing query validation in `backend/endpoints/scan_operations.py`; exact new limits are plan work.] |
| Data minimization | Return only display-safe platform/result facts. Do not expose storage root paths, raw checkpoints or raw provider exception text. [CITED: Phase UI contract `41-UI-SPEC.md`; VERIFIED: existing `ScanOperationItemResult` schema.] |
| Stale data | Scope all result output to the active attempt and retain current client ordering guards. [VERIFIED: codebase `backend/handler/scan_operation_projection.py`, `frontend/src/v2/composables/useScanOperationStatus/index.ts`] |

## Validation Architecture

The global validation setting is enabled, but the locked phase rule overrides the normal test-first/test-suite workflow. Before human UAT do not add, change or run tests. Do not weaken existing tests. [VERIFIED: `.planning/config.json`; CITED: Phase context and UI contract]

Required evidence before UAT:

1. Run frontend typecheck and production build only after implementation.
2. Use controlled synthetic running and completed operation snapshots with 1,000 current-attempt rows. Do not create runtime database resets, permanent fixtures or test-suite files.
3. In a browser, inspect 320, 600, 960, 1280 and 1920px in both themes. Verify mouse, touch, keyboard and gamepad-compatible native controls.
4. Verify a remote name search finds an item beyond page one; combine name/platform/outcome filters; change page and confirm rows are replaced; open the action-required deep link; confirm closing clears the page and a closed disclosure fetches no rows.
5. Verify distinct scan-total and Windows inventory labels, conditional trustworthy current platform, compact completion, maximum three action-required examples and unchanged scan controls/settings.

## Recommended Plan Shape

**Recommended plan count: 5, within the maximum of 8.**

| Plan | Wave | Depends on | Scope and acceptance focus |
| --- | --- | --- | --- |
| 41-01 | 1 | none | Extend durable operation query/response projection: summary-only mode, attempt-scoped current platform, minimal platform descriptor, allow-listed result filtering, totals, actionable counts/sample. Regenerate OpenAPI frontend types. |
| 41-02 | 2 | 41-01 | Replace accumulating status-page handling with a typed one-page result-query composable and adapter. Add URL-backed query synchronization, stale-response protection and fixed page 50. |
| 41-03 | 2 | 41-01 | Extract compact operation summary/actionable presentation from the status panel. Keep lifecycle controls and display only trustworthy progress/current platform. |
| 41-04 | 3 | 41-02, 41-03 | Build the closed-by-default result disclosure with existing ZA controls, server-wide search/filters/pagination, focus/live-region behavior, responsive layout and all 18 locale updates. |
| 41-05 | 4 | 41-04 | Update frontend/backend architecture documentation, run typecheck and production build, then perform the specified synthetic 1,000-game desktop/mobile browser inspection. No tests or test suites before human UAT. |

## Assumptions Log

| # | Claim | Risk if Wrong |
| --- | --- | --- |
| A1 | A persistent worker-written `checkpoint` extension is the minimum safe home for `active_platform`. | A separate normalized operation-progress field may be preferable if checkpoint schema ownership prohibits this extension. Validate while planning against existing checkpoint helpers. |
| A2 | Platform filtering can safely join the item mapping to `PlatformStorageMapping` for all current scan result rows. | Historical/deactivated mappings might require a denormalized platform identity captured with each operation item. Inspect real migration/history guarantees before implementation. |
| A3 | Synthetic browser data can be supplied through an existing local controlled API/interception path without tests. | If no safe existing path exists, add only an ephemeral developer-controlled fixture mechanism outside production behavior, subject to plan review. |

## Sources

- [VERIFIED: codebase] `41-CONTEXT.md` and `41-UI-SPEC.md`
- [VERIFIED: codebase] `backend/endpoints/scan_operations.py`, `backend/endpoints/responses/scan_operations.py`, `backend/handler/scan_operation_projection.py`, `backend/handler/database/scan_operations_handler.py`, `backend/handler/scan_inventory_status.py`
- [VERIFIED: codebase] `frontend/src/v2/data/adapters/scanOperations.ts`, `frontend/src/v2/composables/useScanOperationStatus/index.ts`, `frontend/src/v2/composables/useScanLifecycle/index.ts`, `frontend/src/v2/components/Scan/OperationStatusPanel.vue`, `frontend/src/v2/components/Scan/InventoryStatusSummary.vue`
- [VERIFIED: codebase] `.claude/skills/frontend-v2-components/SKILL.md`, `frontend-v2-patterns/SKILL.md`, `frontend-v2-input/SKILL.md`, `frontend-v2-theming/SKILL.md`, `frontend-i18n/SKILL.md`, `CLAUDE.md`
