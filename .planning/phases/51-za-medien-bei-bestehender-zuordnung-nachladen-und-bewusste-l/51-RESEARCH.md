# Phase 51: ZA: Medien bei bestehender Zuordnung nachladen und bewusste Löschungen erhalten - Research

**Researched:** 2026-11-26
**Domain:** Explicit manual provider-media refresh and durable provider-media suppression
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- An explicit reassignment to the same provider ID and an explicit media refresh
  both fetch the current provider catalog rather than returning early because an
  old catalog is non-empty.
- The existing manual assignment, provider discovery, publication and response
  lifecycle remain the only integration points. No background crawl or provider
  special case is introduced.
- IGDB legacy assignments are the first concrete regression target. Other
  supported manual providers follow the shared contract where their existing
  lifecycle already uses it.
- Reuse the shared provider candidate discovery and stable native identity or
  normalized URL candidate key. Keep usable existing candidates without a
  duplicate or unnecessary download.
- Add a missing, non-suppressed candidate, including one that failed a previous
  download and one newly added upstream since the last explicit refresh.
- Do not replace, remove or reposition manually uploaded images, chosen covers
  or existing placements while reconciling provider-owned media.
- Reuse `provider_media_suppressions` and its existing candidate-key/
  normalization behavior. Do not add a second tombstone implementation.
- A deliberately removed provider item stays suppressed across restart, same-ID
  reassignment and repeated refresh, including provider URL-size variants.
- An empty provider catalog is not treated as an explicit user deletion, and a
  suppression for one item never blocks unrelated provider candidates.
- Preserve the established error and partial-success mechanisms, distinguish
  provider lookup, download, storage, catalog publication and response errors,
  and leave retries possible when no suppression exists.
- Do not claim a successful media import merely because metadata assignment
  returned a ROM. Record isolated fixture/runtime evidence without production,
  NAS or secret access.
- Before live UAT, use only targeted runtime evidence plus typecheck, lint and
  build. Do not add or execute tests; post-acceptance direct logic tests remain
  a separate follow-up.

### the agent's Discretion

- Choose the smallest shared extraction needed to keep production files within
  repository size rules, preserving the endpoint-handler-layer boundaries.
- Select isolated fixture plumbing and exact error presentation that fit the
  existing product contracts.

### Deferred Ideas (OUT OF SCOPE)

Post-acceptance direct API and logic tests for idempotency, suppression,
new candidates and error paths. No scheduled whole-library refresh is in this
phase.
</user_constraints>

## Project Constraints (from AGENTS.md)

- Work only in `/home/d1sk/pc-game-download-portal` on the canonical Linux checkout and preserve unrelated worktree changes. [VERIFIED: AGENTS.md]
- Do not deploy, use a real NAS mount, restart or alter Team4s without explicit authorization. [VERIFIED: AGENTS.md]
- Keep endpoint validation and authorization thin, and retain the endpoint to handler to database/filesystem layering. [CITED: .claude/skills/backend-development/SKILL.md]
- Keep all external-library writes out of the source root and use the owned-resource boundary. [VERIFIED: CLAUDE.md]
- Update domain and architecture documentation with the implementation. [VERIFIED: CLAUDE.md]
- New production files target 500 logical lines or fewer, and existing monoliths must not be enlarged substantially when a coherent extraction is available. [VERIFIED: CLAUDE.md]
- Do not add or execute tests before live UAT for this phase, despite the usual repository test rule. [VERIFIED: 51-CONTEXT.md]
- Do not use browser validation in this phase. [VERIFIED: task assignment]

## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| MEDIA-51-01 | Same-provider manual reassignment obtains the current catalog. | Same-ID IGDB gate and the retained-catalog refresh path are identified below. [VERIFIED: ROADMAP.md, backend/endpoints/roms/__init__.py] |
| MEDIA-51-02 | Explicit media refresh reconciles current provider media additively. | `prepare_provider_media_refresh` and `refresh_provider_owned_media` are the existing shared lifecycle. [VERIFIED: backend/handler/metadata/rom_media.py] |
| MEDIA-51-03 | Explicitly deleted provider media remains deleted. | Existing `operator_suppressed` tombstones and `candidate_key` cover optimistic and locked checks. [VERIFIED: backend/handler/database/provider_media_suppression.py, backend/handler/database/roms_handler.py] |
| MEDIA-51-04 | Manual uploads, cover choice and placement remain authoritative. | The provider reconciliation only mutates a matched provider row; placement and upload mutations remain separate. [VERIFIED: backend/handler/database/roms_handler.py, backend/endpoints/roms/media.py] |
| MEDIA-51-05 | Lookup and per-item outcomes remain truthful and retryable. | Existing per-item failures need stage-aware propagation through the current response path. [VERIFIED: backend/handler/metadata/rom_media.py, backend/endpoints/roms/media.py] |
| DOC-51-01 | Architecture documentation describes the changed refresh contract. | `docs/BACKEND_ARCHITECTURE.md` and `docs/FRONTEND_ARCHITECTURE.md` already own the relevant contracts. [VERIFIED: docs/BACKEND_ARCHITECTURE.md, docs/FRONTEND_ARCHITECTURE.md] |

## Summary

The required implementation is a narrow repair of one existing lifecycle, not a new provider pipeline. The manual `PUT /api/roms/{id}` flow only calls IGDB when the submitted ID differs from `rom.igdb_id`; a deliberate same-ID assignment therefore leaves `manual_igdb_media` unset and `publish_igdb` does nothing. Separately, `prepare_provider_media_refresh` returns an existing non-empty `igdb_metadata.provider_media` snapshot before calling IGDB, so explicit refresh does not see media added upstream after the snapshot. [VERIFIED: backend/endpoints/roms/__init__.py, backend/handler/metadata/rom_media.py]

The safe common fix is to make the explicit entry points acquire the current known IGDB record, retain only its provider-media inventory under the existing `igdb_metadata.provider_media` key with an optimistic version check, then invoke the existing candidate discovery and publisher. The shared reconciler must first skip a matching active provider row with a usable owned path, while still retrying absent, tombstoned-but-not-suppressed, or previously failed candidates. It must retain both suppression checks: the pre-download batch check and the locked reconciliation check. [VERIFIED: backend/handler/metadata/rom_media.py, backend/handler/database/roms_handler.py, backend/handler/database/provider_media_suppression.py]

**Primary recommendation:** Extract a focused explicit-provider-catalog preparation result in `backend/handler/metadata/rom_media.py`, use it from same-ID manual IGDB assignment and `POST /roms/{id}/media/refresh`, and make the existing generic reconciler reuse only a matching active provider-owned path. Keep all actions synchronous to the explicit request and surface lookup/partial failures through the existing response and snackbar path. [VERIFIED: backend/handler/metadata/rom_media.py, backend/endpoints/roms/media.py, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Same-ID provider catalog acquisition | API / Backend | External provider | The protected manual endpoint delegates provider fetch and persistence to the metadata handler. [VERIFIED: backend/endpoints/roms/__init__.py, .claude/skills/backend-development/SKILL.md] |
| Candidate normalization and suppression | API / Backend | Database / Storage | Provider identity is normalized before batch lookup, then rechecked under the locked parent transaction. [VERIFIED: backend/handler/metadata/rom_media.py, backend/handler/database/provider_media_suppression.py] |
| Image download and owned-resource staging | API / Backend | Database / Storage | Provider bytes are downloaded and stored only through `fs_resource_handler`, then associated with the parent ROM. [VERIFIED: backend/handler/metadata/rom_media.py] |
| Placement, active-cover and upload preservation | Database / Storage | API / Backend | Placement and cover selection are separate versioned mutations, and uploads use a distinct origin. [VERIFIED: backend/endpoints/roms/media.py, backend/handler/database/roms_handler.py] |
| Explicit refresh feedback | Browser / Client | API / Backend | The v2 dialog invokes the established API, but must await and present its outcome instead of discarding it. [VERIFIED: frontend/src/services/api/rom.ts, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue] |

## Standard Stack

### Core

| Library / Component | Version | Purpose | Why Standard |
|---|---:|---|---|
| FastAPI protected ROM routes | Existing repository stack | Authorize and serialize the explicit media-refresh request. | This route already owns `roms.write`, visibility checks and the detailed ROM response. [VERIFIED: backend/endpoints/roms/media.py] |
| SQLAlchemy ORM via `db_rom_handler` | Existing repository stack | Version-locked catalog updates and durable provider tombstones. | Current provider reconciliation uses the ROM parent lock and optimistic timestamp. [VERIFIED: backend/handler/database/roms_handler.py] |
| Existing IGDB metadata handler | Existing repository stack | Obtain an authoritative catalog for a known IGDB ID. | Both manual assignment and legacy recovery already call `meta_igdb_handler.get_rom_by_id`. [VERIFIED: backend/endpoints/roms/__init__.py, backend/handler/metadata/rom_media.py] |
| Existing owned-resource handler | Existing repository stack | Bounded image storage outside the immutable source library. | `_download_provider_image` stages images through `store_owned_media_image`. [VERIFIED: backend/handler/metadata/rom_media.py] |

### Supporting

| Component | Purpose | When to Use |
|---|---|---|
| `discover_provider_media` | Produces stable native-ID or normalized URL-digest candidates. | Always, before suppression lookup or provider-media reconciliation. [VERIFIED: backend/handler/metadata/rom_media.py] |
| `provider_media_suppression` | Reuses durable suppression and `candidate_key` semantics. | Before network/storage work and under the locked publication transaction. [VERIFIED: backend/handler/database/provider_media_suppression.py] |
| `refresh_provider_owned_media` | Performs additive per-candidate publication. | Both same-ID assignment and explicit refresh must call this existing owner. [VERIFIED: backend/handler/metadata/rom_media.py] |
| `refreshOwnedMedia` client and `RefreshMetadataDialog` | Calls the established endpoint and presents the result. | Keep one client request path, adding awaited success/error settlement only. [VERIFIED: frontend/src/services/api/rom.ts, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue] |

**Installation:** No package installation is needed. [VERIFIED: codebase inspection]

## Package Legitimacy Audit

Not applicable. This phase installs no external package and uses only repository dependencies. [VERIFIED: phase scope]

## Architecture Patterns

### System Architecture Diagram

```text
Manual same-ID PUT or explicit Media refresh
        |
        v
Protected endpoint: visibility + roms.write + expected_version
        |
        v
Shared metadata preparation
  IGDB known ID -> current provider record -> retain provider_media snapshot
        | provider lookup failure
        +---------------------------------> stage-aware 409 response -> v2 error snackbar
        |
        v
discover_provider_media -> candidate_key -> existing suppression lookup
        |                                   |
        |                                   +-> suppressed: skip, no network/store
        v
active matching owned path? -----------------> yes: retain unchanged
        |
        no
        v
bounded provider download -> owned resource stage -> locked ROM reconciliation
                                                   |
                                                   +-> suppressed/version/publication conflict:
                                                        clean staged file, report item failure
        |
        v
Detailed ROM response -> existing v2 state refresh
```

### Recommended Project Structure

```text
backend/
├── endpoints/roms/__init__.py       # keep route validation and manual assignment delegation only
├── endpoints/roms/media.py          # preserve refresh route and translate typed outcome to HTTP
├── handler/metadata/rom_media.py    # own current catalog preparation and additive generic reconciliation
├── handler/database/provider_media_suppression.py # one suppression policy and candidate key
└── handler/database/roms_handler.py # lock-protected catalog state only
frontend/src/
├── services/api/rom.ts              # unchanged single request client
└── v2/components/Dialogs/RefreshMetadataDialog.vue # await result and show existing error state
```

### Pattern 1: Current catalog first, then additive reconciliation

**What:** For an explicit known-IGDB refresh, obtain the live record before deciding which candidates exist, persist the normalized provider-media snapshot under the existing metadata field with the supplied expected version, then reconcile the discovered candidates. Do not replace the complete metadata object with an unscoped external response during a same-ID action. [VERIFIED: backend/handler/metadata/rom_media.py, backend/endpoints/roms/__init__.py]

**When to use:** Same-ID manual IGDB assignment and the existing explicit parent-media refresh only. Scan, scheduler, bulk/media-only scan and provider-specific background paths remain unchanged. [VERIFIED: 51-CONTEXT.md, backend/endpoints/sockets/scan_platform_execution.py]

**Implementation shape:**

```python
# Source pattern: backend/handler/metadata/rom_media.py
prepared = await prepare_explicit_provider_media_refresh(rom, expected_version)
rom, provider, source = prepared.rom, prepared.provider, prepared.source
rom, failures = await refresh_provider_owned_media(
    rom, rom.updated_at, provider, source
)
```

The helper should return a typed, stage-aware failure for an IGDB lookup that does not confirm the known ID, rather than silently falling back to an old non-empty snapshot. [ASSUMED]

### Pattern 2: Reuse active owned paths before download

**What:** Build a provider-qualified map of active `RomOwnedMedia` rows keyed by the same `(provider, provider_media_id, role)` candidate key. A candidate whose row is active, role-compatible and has a non-empty owned path is already reconciled and must be skipped without a new GET or storage write. A suppressed tombstone always wins, and an absent or unusable row remains eligible for retry. [VERIFIED: backend/handler/metadata/steam_owned_media.py, backend/models/rom.py, backend/handler/database/provider_media_suppression.py]

**When to use:** The generic `refresh_provider_owned_media` path only. Do not import Steam's complete-inventory retirement behavior, because Phase 51 is additive and an empty catalog is not deletion. [VERIFIED: backend/handler/metadata/steam_owned_media.py, 51-CONTEXT.md]

### Pattern 3: Preserve partial-success truthfulness

**What:** Continue candidate-by-candidate after a download, storage or catalog-publication failure, retain completed candidates, and return an outcome containing the failed candidate identity, role and failure stage. The endpoint must not return an ordinary successful media-import signal when the explicit operation had a lookup failure or one or more item failures. [VERIFIED: backend/handler/metadata/rom_media.py, backend/endpoints/roms/media.py]

**When to use:** Explicit refresh and same-ID manual assignment. The existing detailed ROM response remains the authoritative state after a fully successful operation. [VERIFIED: backend/endpoints/roms/media.py]

### Anti-Patterns to Avoid

- **A second IGDB media pipeline:** Do not introduce a scheduler, crawler, provider-specific endpoint or client-side discovery. It would bypass the shared normalization, suppression and owned-storage controls. [VERIFIED: 51-CONTEXT.md]
- **Treating a non-empty persisted inventory as fresh:** It prevents discovery of media added upstream. [VERIFIED: backend/handler/metadata/rom_media.py]
- **Re-downloading all candidates:** It causes unnecessary owned-file churn and can overwrite a reusable provider row's path. Use the stable candidate identity to skip usable active rows. [VERIFIED: backend/handler/metadata/steam_owned_media.py]
- **Clearing provider rows absent from an explicit catalog:** An empty provider response is not an operator deletion and Phase 51 is additive. [VERIFIED: 51-CONTEXT.md]
- **Restoring a provider tombstone:** `operator_suppressed=True` is deliberate operator intent and is enforced before and during publication. [VERIFIED: backend/handler/database/provider_media_suppression.py, backend/handler/database/roms_handler.py]
- **Fire-and-forget UI refresh:** The current dialog's `void` call discards a 409 error, so it must await the unchanged API client and use existing snackbar error presentation. [VERIFIED: frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Provider identity | A new IGDB URL comparison or separate tombstone table | `discover_provider_media`, normalized HTTPS URL digest and `candidate_key` | Existing native-ID and URL-variant semantics are already shared by deletion and publication. [VERIFIED: backend/handler/metadata/rom_media.py, backend/handler/database/provider_media_suppression.py] |
| Explicit deletion retention | A boolean in metadata JSON or UI-only hidden list | Existing `RomOwnedMedia` provider tombstone with `operator_suppressed` | It persists across restart and is checked in optimistic and locked paths. [VERIFIED: backend/models/rom.py, backend/handler/database/roms_handler.py] |
| Storage publication | Direct filesystem writes from endpoint or UI | `fs_resource_handler.store_owned_media_image` plus current DB reconciliation | The existing owner bounds image size and keeps media outside the external library. [VERIFIED: backend/handler/metadata/rom_media.py] |
| Concurrency | A new refresh lock | Existing `expected_version` plus `_get_locked_owned_media_rom` | The current contract detects a changed media catalog and rechecks suppression under lock. [VERIFIED: backend/endpoints/roms/media.py, backend/handler/database/roms_handler.py] |
| Feedback transport | A parallel frontend refresh request | Existing `refreshOwnedMedia` service and dialog snackbar lifecycle | One API path avoids divergent client behavior. [VERIFIED: frontend/src/services/api/rom.ts, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue] |

**Key insight:** The durable catalog row is the single source of truth for provider identity, deletion intent, path reuse and placement isolation. The live provider response only supplies the current candidate set for an explicit request. [VERIFIED: backend/models/rom.py, backend/handler/database/provider_media_suppression.py]

## Common Pitfalls

### Pitfall 1: Same-ID gate prevents provider discovery

**What goes wrong:** `manual_igdb_media` is created only when the submitted IGDB ID differs, so a same-ID reassignment performs no current-catalog lookup and `publish_igdb` receives `None`. [VERIFIED: backend/endpoints/roms/__init__.py, backend/handler/metadata/rom_media.py]

**How to avoid:** Treat explicitly supplied same ID as an explicit provider-media refresh trigger, fetch that known record, retain only its media inventory and pass it to the existing publisher. [ASSUMED]

**Warning sign:** A legacy ROM retains an IGDB ID but screenshots/artwork available at IGDB never appear after an administrator resubmits the same ID. [VERIFIED: 51-CONTEXT.md]

### Pitfall 2: Stale retained catalog masks new upstream media

**What goes wrong:** `prepare_provider_media_refresh` returns a non-empty retained IGDB inventory before fetching the known ID. [VERIFIED: backend/handler/metadata/rom_media.py]

**How to avoid:** For explicit events, make the live known-ID lookup authoritative for the source inventory, but retain the existing snapshot only as persisted evidence after a successful lookup. [ASSUMED]

### Pitfall 3: Generic reconciliation downloads media it already owns

**What goes wrong:** The generic loop only filters suppressed candidates, then downloads each remaining candidate before discovering the matching persisted row in locked reconciliation. [VERIFIED: backend/handler/metadata/rom_media.py, backend/handler/database/roms_handler.py]

**How to avoid:** Add an optimistic active-and-usable inventory lookup using the existing candidate key before the download. Keep the locked check because deletion or a concurrent mutation can happen after this lookup. [ASSUMED]

### Pitfall 4: Partial outcome appears successful to the operator

**What goes wrong:** `publish_igdb` catches `ValueError` and `OSError`, logs a warning, returns the ROM, and the current refresh dialog discards its promise. [VERIFIED: backend/handler/metadata/rom_media.py, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue]

**How to avoid:** Carry typed failure stages to the endpoint, return a non-success outcome for an explicit request with any failure, and await the unchanged client call to show the error. Preserve successfully associated sibling media and permit a later retry. [ASSUMED]

## Failure Matrix

| Stage | Existing behavior | Required Phase 51 behavior | Persisted result / retry |
|---|---|---|---|
| Provider lookup | Legacy recovery may fall back to old source when a known ID does not yield IGDB data. [VERIFIED: backend/handler/metadata/rom_media.py] | Mark lookup failure distinctly; do not call reconciliation with a falsely current source. [ASSUMED] | Existing catalog, suppressions, uploads, selections and placements remain unchanged; explicit retry remains possible. [ASSUMED] |
| Candidate normalization | Invalid HTTPS/list shape raises `ValueError`. [VERIFIED: backend/handler/metadata/rom_media.py] | Preserve validation and identify it as preparation/input failure. [ASSUMED] | No download or publication; retry after valid provider data. [ASSUMED] |
| Suppressed candidate | Batch lookup skips candidate before network work. [VERIFIED: backend/handler/metadata/rom_media.py] | Preserve skip, including normalized URL-size aliases for same ROM/role. [VERIFIED: backend/handler/database/provider_media_suppression.py] | Tombstone remains intact; no retry until user has a future explicit restore contract, which is out of scope. [VERIFIED: 51-CONTEXT.md] |
| Existing usable active candidate | Generic path downloads it again. [VERIFIED: backend/handler/metadata/rom_media.py] | Skip download/storage and retain its path, role and placements unchanged. [ASSUMED] | No mutation; other missing candidates continue. [ASSUMED] |
| Provider download | Per-item `ValueError`/`OSError` is accumulated, later siblings continue. [VERIFIED: backend/handler/metadata/rom_media.py] | Keep this partial-success behavior and tag stage as download. [ASSUMED] | No candidate row/path for the failed new item; later explicit refresh retries it. [ASSUMED] |
| Owned storage | Storage failure enters the same per-item failure path. [VERIFIED: backend/handler/metadata/rom_media.py] | Preserve cleanup of unassociated path and tag stage as storage. [ASSUMED] | No visible media row; retry remains possible. [ASSUMED] |
| Locked catalog publication | Changed version or a deletion during download rejects association. [VERIFIED: backend/handler/database/roms_handler.py, backend/tests/handler/test_provider_media_suppression.py] | Recheck suppression under lock, delete staged unassociated file, tag catalog-publication conflict. [ASSUMED] | Deletion remains authoritative; non-suppressed version conflict can be retried with fresh detail version. [ASSUMED] |
| Response / UI | Explicit endpoint returns generic 409 for failures; dialog currently ignores the promise. [VERIFIED: backend/endpoints/roms/media.py, frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue] | Use the established error response and snackbar, with stage-aware detail that does not falsely claim full import. [ASSUMED] | Successful siblings remain visible after canonical refetch; user receives failure feedback. [ASSUMED] |

## Code Examples

### Candidate eligibility before network I/O

```python
# Source pattern: backend/handler/metadata/steam_owned_media.py
suppressed = db_rom_handler.get_provider_media_suppressions(rom.id, candidates)
active = db_rom_handler.get_provider_media_inventory(rom.id, candidates)

for candidate in candidates:
    if candidate_key(candidate) in suppressed:
        continue
    if _reusable_owned_path(active.get(candidate_key(candidate)), candidate):
        continue
    path, mime_type = await _download_provider_image(rom, candidate)
    # Existing locked reconcile remains mandatory after this optimistic check.
```

`get_provider_media_inventory` is a proposed small generic query, patterned after the existing Steam-specific inventory lookup; it must include provider, identity, role, active state and non-empty path. [ASSUMED]

### Same-ID manual IGDB scope

```python
# Source pattern: backend/endpoints/roms/__init__.py
if "igdb_id" in provided_fields and cleaned_data["igdb_id"]:
    igdb_rom = await meta_igdb_handler.get_rom_by_id(rom, cleaned_data["igdb_id"])
    if igdb_rom.get("igdb_id"):
        if cleaned_data["igdb_id"] != rom.igdb_id:
            cleaned_data.update(igdb_rom)
        manual_igdb_media = rm.retain_igdb_media(cleaned_data, igdb_rom)
```

This preserves the established full metadata replacement only for an ID change while permitting a same-ID request to update its retained provider-media source. The exact helper boundary should move this provider-specific orchestration out of the 2,323-line route module. [ASSUMED]

## State of the Art

| Old Approach | Current Required Approach | Impact |
|---|---|---|
| Retained non-empty IGDB provider media is treated as sufficient for explicit refresh. [VERIFIED: backend/handler/metadata/rom_media.py] | Explicit action obtains current known-ID provider inventory first, then persists and reconciles additively. [ASSUMED] | Newly upstream-available candidates become discoverable without a scan or crawler. [ASSUMED] |
| Generic reconciler downloads every non-suppressed candidate. [VERIFIED: backend/handler/metadata/rom_media.py] | Reuse a matching active usable provider-owned path by stable identity. [ASSUMED] | Idempotent refresh avoids redundant downloads and path changes. [ASSUMED] |
| Explicit refresh UI starts request without awaiting it. [VERIFIED: frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue] | Await existing API call and report success or failure through existing feedback. [ASSUMED] | Operators can distinguish completed import from partial/error outcome. [ASSUMED] |

## Documentation Requirements

- Update `docs/BACKEND_ARCHITECTURE.md` in the metadata/media section: explicit same-ID IGDB assignment and explicit media refresh fetch the current known-ID catalog, reuse stable active rows, remain additive, and preserve provider suppression. [VERIFIED: docs/BACKEND_ARCHITECTURE.md]
- Update `docs/FRONTEND_ARCHITECTURE.md` MediaTab/refresh contract: the one existing refresh action awaits canonical settlement and reports partial/error outcomes. [VERIFIED: docs/FRONTEND_ARCHITECTURE.md]
- Add concise current-contract docstrings at the extracted metadata-preparation helper and generic reusable-inventory query. Do not add historical Phase references in source comments. [VERIFIED: CLAUDE.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | A stage-aware typed preparation/result object is the smallest compatible way to distinguish lookup, download, storage and publication failures. | Architecture Patterns, Failure Matrix | The planner may need to select an existing error container instead. |
| A2 | Same-ID assignment should update only retained `provider_media`, not overwrite all provider metadata fields. | Code Examples | An unintended metadata rewrite could bypass manual/provenance protections. |
| A3 | A generic active provider-media inventory query is preferable to expanding the Steam-specific API. | Code Examples | The chosen helper signature may need adjustment to avoid database-handler growth. |
| A4 | The existing 409 response plus snackbar can carry truthful stage-aware refresh feedback without an OpenAPI response-model change. | Failure Matrix | A schema/client change may be required if UX needs structured item failures. |

## Resolved Research Decisions

1. **RESOLVED: Existing response and partial-success semantics**
   - Keep the existing protected-route response contract. Return the canonical `DetailedRomSchema` only when catalog preparation and every eligible candidate complete without a failure. When lookup/preparation fails, or any eligible candidate has a download, storage, or locked-publication failure, use the route's established HTTP 409 detail convention with concise stage and candidate summary. Already-published siblings remain committed and become visible through the normal later canonical refetch; the existing client rejection and snackbar path presents the response detail and leaves retry available. Do not add a response schema, generated-client type, endpoint, or second client workflow. [RESOLVED: Phase 51 revision, 2026-11-26]

2. **RESOLVED: Confirmed empty current provider catalog**
   - After a successful known-provider lookup, persist the normalized current `provider_media` snapshot even when it is empty, using the existing optimistic version protection. Reconciliation then has zero candidates and performs no deletion, retirement, placement change, cover change, or suppression change. A lookup failure must not replace the retained snapshot. This prevents an old snapshot from being represented as current indefinitely while retaining the additive, no-delete contract. Record this invariant in the preparation-helper docstring. [RESOLVED: Phase 51 revision, 2026-11-26]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Existing configured IGDB client | Explicit known-ID catalog lookup | Not probed | Not applicable | Isolated fixture/runtime evidence only; no production credentials or service access. [VERIFIED: task assignment] |
| Existing backend/frontend toolchain | Post-UAT validation commands | Not probed | Not applicable | No test or runtime command is authorized before live UAT. [VERIFIED: 51-CONTEXT.md] |

**Missing dependencies with no fallback:** None identified without violating the no-secret/no-production-access constraint. [VERIFIED: task assignment]

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | pytest with async endpoint and handler tests, plus frontend typecheck/lint/build tooling. [CITED: .claude/skills/backend-development/SKILL.md, CLAUDE.md] |
| Existing relevant tests | `backend/tests/handler/metadata/test_rom_media.py`, `backend/tests/handler/test_provider_media_suppression.py`, `backend/tests/endpoints/roms/test_media.py`, `backend/tests/endpoints/roms/test_rom.py`. [VERIFIED: codebase grep] |
| Pre-UAT command | None. Do not create or run tests for this phase before live UAT. [VERIFIED: 51-CONTEXT.md] |
| Post-UAT technical evidence | Targeted isolated fixture/runtime evidence, typecheck, lint and build only, as permitted by the phase decision. [VERIFIED: 51-CONTEXT.md] |

### Phase Requirements to Evidence Map

| Req ID | Behavior | Evidence Type | Pre-UAT Status |
|---|---|---|---|
| MEDIA-51-01 | Same-ID IGDB assignment acquires current catalog. | Isolated fixture/runtime observation. [ASSUMED] | Deferred until authorized live-UAT workflow. [VERIFIED: 51-CONTEXT.md] |
| MEDIA-51-02 | Explicit refresh adds new/current candidates without a second pipeline. | Isolated fixture/runtime observation. [ASSUMED] | Deferred until authorized live-UAT workflow. [VERIFIED: 51-CONTEXT.md] |
| MEDIA-51-03 | Suppressed URL/native candidate is never republished. | Existing test inventory and later direct logic follow-up. [VERIFIED: backend/tests/handler/test_provider_media_suppression.py] | Deferred by locked decision. [VERIFIED: 51-CONTEXT.md] |
| MEDIA-51-04 | Uploads, selected cover and placements remain unchanged. | Isolated fixture/runtime observation. [ASSUMED] | Deferred until authorized live-UAT workflow. [VERIFIED: 51-CONTEXT.md] |
| MEDIA-51-05 | Lookup and partial errors are observable and retryable. | Isolated fixture/runtime observation and lint/typecheck/build. [ASSUMED] | Deferred until authorized live-UAT workflow. [VERIFIED: 51-CONTEXT.md] |
| DOC-51-01 | Architecture docs match implementation. | Documentation review. [ASSUMED] | Include in implementation acceptance criteria. [VERIFIED: CLAUDE.md] |

### Wave 0 Gaps

None for this phase. Tests are deliberately deferred, not missing by accident. Inventory only was performed; no test was created or started. [VERIFIED: task assignment, 51-CONTEXT.md]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | Yes | Existing protected routes and `roms.write` scope. [VERIFIED: backend/endpoints/roms/media.py] |
| V3 Session Management | No new surface | No session behavior changes are planned. [VERIFIED: phase scope] |
| V4 Access Control | Yes | Existing visibility assertion before media mutation. [VERIFIED: backend/endpoints/roms/media.py] |
| V5 Input Validation | Yes | Existing provider validation accepts bounded media lists and normalized HTTPS URLs only. [VERIFIED: backend/handler/metadata/rom_media.py] |
| V6 Cryptography | Yes, identity only | Existing SHA-256 URL digest is an identity key, not a security authorization primitive. [VERIFIED: backend/handler/metadata/rom_media.py] |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Provider URL manipulation / SSRF expansion | Tampering | Retain existing HTTPS-only normalization and existing configured provider handler. Do not accept browser-supplied provider URLs. [VERIFIED: backend/handler/metadata/rom_media.py, backend/endpoints/roms/media.py] |
| Deleted media reappears | Tampering | Batch suppression before I/O and locked suppression before association. [VERIFIED: backend/handler/database/provider_media_suppression.py, backend/handler/database/roms_handler.py] |
| Concurrent deletion during refresh | Race / Tampering | Existing version lock, publication failure and staged-file cleanup. [VERIFIED: backend/handler/metadata/rom_media.py, backend/handler/database/roms_handler.py] |
| Source-library write | Tampering | Store provider bytes only in owned resources; do not alter scan/source paths. [VERIFIED: backend/handler/metadata/rom_media.py, CLAUDE.md] |

## Sources

### Primary (HIGH confidence)

- `backend/endpoints/roms/__init__.py` - same-ID IGDB gate, retained media handoff and manual assignment call flow.
- `backend/handler/metadata/rom_media.py` - catalog retention, explicit refresh preparation, candidate discovery and per-item generic reconciliation.
- `backend/handler/database/provider_media_suppression.py` - stable suppression key and URL-digest cross-provider behavior.
- `backend/handler/database/roms_handler.py` - lock-protected publication, durable tombstone and placement behavior.
- `backend/endpoints/roms/media.py` - protected explicit refresh, deletion and response behavior.
- `backend/handler/metadata/steam_owned_media.py` - existing active-owned-path reuse pattern.
- `frontend/src/services/api/rom.ts` and `frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue` - existing single client flow and discarded promise.
- `docs/BACKEND_ARCHITECTURE.md` and `docs/FRONTEND_ARCHITECTURE.md` - current documented media/suppression contracts.

### Secondary (MEDIUM confidence)

- `51-CONTEXT.md` - locked phase scope, operator decisions and deferred test policy.
- `CLAUDE.md`, `AGENTS.md`, `.claude/skills/backend-development/SKILL.md` - repository constraints and layer conventions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, all required components are already in the repository and no package is added.
- Architecture: HIGH, the exact endpoint, metadata, database and frontend call flow was traced in source.
- Pitfalls: HIGH for the two stale gates and swallowed UI result, MEDIUM for the smallest typed outcome representation.

**Research date:** 2026-11-26
**Valid until:** 2026-12-26, unless the current media lifecycle changes first.
