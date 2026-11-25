# Phase 49: ZA Beta14 Upgrade without Download Inventory Repair - Research

**Researched:** 2026-11-25
**Domain:** Safe recovery of a persisted shared-download inventory through the existing manifest lifecycle
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Upgrade reproduction and evidence
- Reproduce first on a disposable fixture rooted at the exact Beta14 release
  baseline, with a realistic PS3 folder game containing many synthetic small
  files and persisted `RomFile` rows but no FOLDER component or manifest data.
- Include an existing PS3 ISO and another platform at, above, and below the
  inclusive 4,000,000,000-byte boundary without new inventory, plus unknown,
  unreadable, stale, unauthorized, and path-boundary cases.
- Never use, reset, or change production databases, NAS data, existing Dev
  accounts, or permanent Docker resources. Do not seed a FOLDER component to
  make the upgrade case appear successful.

### Shared downloader lifecycle
- Preserve one common downloader, dialog, queue, resolver, inventory builder,
  manifest issuer, and transfer path. Do not add a PS3- or upgrade-specific
  engine, transport, hash path, or filesystem bypass.
- Keep detail projection cheap: it may publish only safely known readiness, and
  must not start a library walk, hashing pass, or unbounded materialization.
- Let the existing explicit, authorized shared-download action perform bounded
  preparation only after visibility, path, version, and known-size eligibility
  checks. The action must keep existing loading and error states.
- Materialize a verified FOLDER component from the current mapped source only
  through the established bounded builder. Do not manufacture a manifest or
  label a legacy `RomFile` set as verified without source checks.

### Compatibility and security
- Retain existing PC, PS3, ISO/single-file, ordinary small-ROM, permission,
  source-staleness, manifest snapshot, member delivery, and storage-policy
  behavior.
- The shared capability remains platform-neutral only for authoritative known
  sizes at or above the threshold; unknown sizes stay unavailable rather than
  inferred.
- Update the inaccurate `ensure_*` contract comment and affected backend and
  frontend architecture documentation in English.

### Verification boundary
- Before human UAT, add, change, and run no automated tests or full suites.
  Use isolated one-off reproduction evidence, static inspection, typecheck,
  scoped lint, and production build only.
- Human Dev UAT performs browser verification on desktop and mobile. The final
  handoff names routes, intended controls, and expected outcomes without
  claiming browser evidence created by this job.

### the agent's Discretion
- Choose the smallest existing-lifecycle seam that can expose a preparing
  shared-download action without making a detail GET mutate source state.
- Choose the bounded fixture scale and temporary harness implementation so it
  proves the migration condition while preserving cleanup and secret rules.

### Deferred Ideas (OUT OF SCOPE)

No production rescan, database reset, NAS mutation, release replacement,
merge, push, or new downloader engine is in this phase.
</user_constraints>

## Summary

The Beta14 upgrade symptom follows a complete dead-end in the current lifecycle. A detailed-ROM GET calls `prepare_folder_download_details()`, which emits `folder_download` only when exactly one persisted `RomComponentKind.FOLDER` has non-missing manifest members with SHA-256 evidence. `GameDetails.vue` renders the sole Game Download entry only when that capability or ordinary PC components exist. Thus a legacy folder game with persisted `RomFile` rows but no FOLDER component has no entry from which it could request preparation. [VERIFIED: codebase, `backend/endpoints/responses/folder_download.py`, `backend/endpoints/responses/rom.py`, `frontend/src/v2/views/GameDetails.vue`]

The explicit manifest request cannot repair this gap today. On a PS3 whole-folder request it calls `ensure_ps3_download_inventory()`, an alias of `ensure_shared_download_inventory()`. That function only validates an already-persisted complete FOLDER component and raises `ValueError` when it is absent. Commit `4f9c610244` deliberately removed the former on-demand `build_shared_download_component()` and `sync_rom_components()` path, despite the follow-up comment and commit `26148a6f1` describing preparation as if it still existed. [VERIFIED: codebase and Git history, `backend/endpoints/download_manifests.py`, `backend/handler/scan_folder_download.py`, commits `4f9c610244`, `26148a6f1`]

**Primary recommendation:** add one explicit `preparable` state to the existing server-owned folder-download projection for a legacy, known-size, eligible source with no FOLDER inventory. Keep GET read-only. Let the existing `POST /roms/{id}/download-manifests` with `whole_folder: true` perform the existing bounded `build_shared_download_component()` and atomic component reconciliation only after visibility, active mapping/path/version, source eligibility, and storage checks. Reload the ROM, then reuse the unchanged eligibility, database manifest issuer, and browser queue. [RECOMMENDED, derived from the locked phase decisions and verified lifecycle]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Identify transfer-ready vs. preparable legacy source | API / Backend | Database / Storage | Persisted FOLDER/member facts and legacy `RomFile` facts are server-owned, and the browser must not infer source state. [VERIFIED: codebase, `folder_download.py`, `models/rom.py`] |
| Bounded inventory materialization | API / Backend | Storage | The existing filesystem builder walks, verifies, hashes, and constructs the neutral FOLDER component through storage policy handles. [VERIFIED: codebase, `handler/filesystem/folder_download.py`, `handler/filesystem/roms_handler.py`] |
| Manifest authorization and immutable issuance | API / Backend | Database / Storage | The protected endpoint verifies ROM visibility, while the existing database handler owns locked manifest persistence. [VERIFIED: codebase, `endpoints/download_manifests.py`, `handler/database/download_manifests_handler.py`] |
| Preparing/loading/error presentation and transport | Browser / Client | API / Backend | The existing dialog and queue already own action loading, manifest consumption, standard/enhanced delivery, retry, cancellation, and resume. [VERIFIED: codebase, `PcComponents.vue`, `DownloadSelectionDialog.vue`, `useBrowserDownloadQueue`] |

## Project Constraints (from AGENTS.md)

- Work only in the canonical Linux checkout, preserve unrelated worktree changes, and do not touch production, NAS, permanent Docker resources, or Team4s without explicit authority. [CITED: `AGENTS.md`]
- Follow the endpoint to handler to database/filesystem layering, use backend response schemas as the API source of truth, and regenerate frontend types when the schema changes. [CITED: `CLAUDE.md`, `.claude/skills/backend-development/SKILL.md`]
- Keep active frontend work in `frontend/src/v2`, use generated types and existing v2 feature patterns, and do not refactor frozen v1 paths. [CITED: `CLAUDE.md`, `.claude/skills/frontend-v2-components/SKILL.md`, `.claude/skills/frontend-v2-patterns/SKILL.md`]
- Update English backend/frontend architecture documentation with the implementation. [CITED: `CLAUDE.md`]
- Do not add, change, or run automated tests before human UAT. Do not perform browser verification before human UAT. [CITED: `49-CONTEXT.md`]
- New production files target at most 500 logical lines. Do not duplicate lifecycle, resolver, inventory, queue, or transport logic. [CITED: `CLAUDE.md`, `49-CONTEXT.md`]

## Standard Stack

### Core

| Existing building block | Purpose | Required use |
|---|---|---|
| `FolderDownloadCapabilitySchema` and `shared_download_capability()` | Detailed-ROM projection of safe shared-download state | Extend the existing response contract with a discriminated transfer-ready/preparable state, without source paths, member lists, or GET-side source work. [VERIFIED: codebase, `backend/endpoints/responses/folder_download.py`] |
| `build_shared_download_component()` | Creates one verified neutral FOLDER group from a directory or simple file | Invoke only at the authorized POST preparation boundary. It already delegates to the bounded inventory and stable hash builder. [VERIFIED: codebase, `backend/handler/filesystem/folder_download.py`] |
| `reconcile_shared_download_inventory()` | Replaces only the FOLDER group while retaining non-FOLDER components | Factor the existing reconciliation into a reusable authorized-preparation operation, using a current ROM snapshot. [VERIFIED: codebase, `backend/handler/scan_folder_download.py`; [RECOMMENDED]] |
| `DownloadManifest` lifecycle | Immutable, user-scoped manifests and delivery-time source validation | Reuse unchanged after preparation has published a verified group. [VERIFIED: codebase, `backend/handler/database/download_manifests_handler.py`, `backend/endpoints/download_manifests.py`] |
| `PcComponents`, `DownloadSelectionDialog`, `useBrowserDownloadQueue` | Existing action, dialog, modes, progress and delivery | Render a preparable action through this one surface, then use the existing POST and queue. [VERIFIED: codebase, frontend GameDetails download components] |

### Supporting

| Existing building block | Purpose | When to use |
|---|---|---|
| `MappingReadContext` | Validates the active mapping ID and expected version before source access | Use when creating the request-time mapped handler, so stale/changed mappings fail closed. [VERIFIED: codebase, `backend/handler/storage/read_context.py`, `backend/handler/filesystem/roms_handler.py`] |
| `async_collect_folder_inventory()` | Bounded directory observations, 20,000 entries, depth 64, two-second deadline | Reuse through the existing builder, never from a detail GET. [VERIFIED: codebase, `backend/handler/filesystem/pc_scan_inventory.py`] |
| `ScanMediaBatch` plus `sync_rom_components()` | Existing publication transaction for component reconciliation | Preserve this persistence path when the prepared component is published. [VERIFIED: codebase, `backend/handler/scan_folder_download.py`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Request-time bounded preparation | A production rescan or manual FOLDER seeding | Both are explicitly out of scope and would not prove the upgrade lifecycle. [CITED: `49-CONTEXT.md`] |
| One preparable capability state | A PS3-only tab/action or second endpoint/transport | Violates the locked single shared lifecycle and would fork authorization, inventory, and UI behavior. [CITED: `49-CONTEXT.md`] |
| Existing persisted-component reconciliation | Manufacture a manifest directly from legacy `RomFile` rows | `RomFile` rows do not carry the verified relative member inventory and SHA-256 evidence required by `shared_download_capability()` and manifest delivery. [VERIFIED: codebase, `models/rom.py`, `folder_download.py`, `folder_download.py` filesystem builder] |

**Installation:** No external package is required. [VERIFIED: codebase and phase scope]

## Architecture Patterns

### System Architecture Diagram

```text
Detail GET
  -> persisted ROM, RomFile, FOLDER facts only
  -> server projection
       ready: verified FOLDER capability
       preparable: authorized legacy facts, no FOLDER
       unavailable: unknown/small/missing/invalid facts
  -> Game Download tab (existing component)
  -> user clicks existing whole-source action
  -> POST /roms/{id}/download-manifests
       -> visibility check
       -> active mapping/path/version and eligibility checks
       -> if ready: validate existing FOLDER
       -> if preparable: bounded builder -> verified FOLDER -> existing reconciliation
       -> reload ROM -> existing eligibility check
       -> existing locked manifest issuer
  -> existing opaque member URLs
  -> existing browser queue (standard or enhanced)
```

The only mutation occurs after a visible user invokes the already-authorized manifest action. A GET exposes a coarse state only and never opens storage, walks a library, hashes files, or persists components. [CITED: `49-CONTEXT.md`; [RECOMMENDED]]

### Pattern 1: Separate “preparable” from “transfer-ready”

**What:** Keep `ready` reserved for one complete persisted FOLDER component with verified members. Add `preparable` only where persisted legacy metadata proves the source is eligible to attempt bounded preparation, but do not report member count, hash, path, or transfer readiness until the builder succeeds. [RECOMMENDED, derived from locked safety boundary]

**When to use:** Only for the upgrade population specified by the phase. Unknown size, missing sources, unreadable/stale mappings, unauthorized requests, and invalid path facts remain unavailable. [CITED: `49-CONTEXT.md`]

**Implementation seam:** Make the response predicate return a small explicit readiness discriminator. `GameDetails` should show the existing Game Download surface for `ready` and `preparable`; `DownloadSelectionDialog`/`PcComponents` should retain their current in-control loading and error behavior while POST does the preparation. The response must never label a preparable source as ready. [RECOMMENDED]

### Pattern 2: Prepare, publish, reload, then issue

**What:** At the existing `whole_folder` POST boundary, run the bounded builder only if the current source is eligible to be prepared, reconcile the FOLDER component through the established transaction, reload the detailed ROM, and then pass the existing shared eligibility and manifest creation path. [RECOMMENDED]

**Why:** The current `ensure_shared_download_inventory()` merely validates a FOLDER component. The required repair is to restore preparation before that validation, but only after the endpoint's visibility check. [VERIFIED: codebase, `download_manifests.py`, `scan_folder_download.py`; [CITED: `49-CONTEXT.md`]

### Pattern 3: Bind request-time source access to the active mapping revision

**What:** Construct the folder builder's `FSRomsHandler` from the active platform mapping and expected mapping version, then allow the existing `MappingReadContext` checks and storage policy handles to fail closed. [RECOMMENDED, based on existing mapping handler pattern]

**Why:** The global handler used by scan code is installed inside the scan's mapping context. A request-time endpoint must not assume that scan-scoped context exists or bypass its version checks. [VERIFIED: codebase, `scan_handler.py`, `roms_handler.py`, `read_context.py`]

### Anti-Patterns to Avoid

- **Mutating detailed-ROM GET:** Do not invoke `build_shared_download_component()` or reconciliation while serializing `DetailedRomSchema`. [CITED: `49-CONTEXT.md`]
- **Using `RomFile` as manifest evidence:** Do not synthesize member hashes/destinations from legacy rows. Build and verify the current mapped source first. [CITED: `49-CONTEXT.md`; [VERIFIED: codebase, `models/rom.py`, filesystem builder]
- **PS3-only preparation branch:** Do not preserve the stale `ensure_ps3_*` name or platform gate as the feature boundary. The preparable predicate is source-fact based and the downstream path is already shared. [CITED: `49-CONTEXT.md`; [VERIFIED: codebase, `download_manifests.py`]
- **Parallel endpoint or queue:** Do not add an upgrade-specific API route, hash path, downloader, dialog, or browser transfer path. [CITED: `49-CONTEXT.md`]

## Don't Hand-Roll

| Problem | Do not build | Use instead | Why |
|---|---|---|---|
| Directory traversal and hashing | A new upgrade scanner | Existing bounded folder inventory and `build_shared_download_component()` | It enforces path validation, stable stat signatures, SHA-256 capture, worker boundaries, and incomplete-inventory failure. [VERIFIED: codebase, `pc_scan_inventory.py`, `folder_download.py`] |
| Mapping safety | Direct host/NAS path access | `MappingReadContext` and `FSRomsHandler.for_mapping()` | They validate active mapping revision and route operations through storage policy. [VERIFIED: codebase, `read_context.py`, `roms_handler.py`] |
| FOLDER persistence | Custom legacy inventory tables or direct member inserts | `sync_rom_components()` and the FOLDER model | Existing manifest locking and member delivery depend on the established component/member model. [VERIFIED: codebase, `scan_folder_download.py`, `download_manifests_handler.py`] |
| Browser transfer | A preparation-specific client flow | Existing `PcComponents` dialog and `useBrowserDownloadQueue` | They already implement standard/enhanced delivery, progress, cancellation, retry, and resume. [VERIFIED: codebase, frontend GameDetails download components] |

**Key insight:** preparation repairs durable inventory evidence; it is not delivery. Only after the builder verifies the current source may the unchanged manifest lifecycle treat the result as transfer-ready. [CITED: `49-CONTEXT.md`; [VERIFIED: codebase, filesystem builder and manifest endpoint]

## Runtime State Inventory

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | Legacy eligible folder ROMs can have persisted `RomFile` rows and `fs_size_bytes` but no `RomComponentKind.FOLDER` or manifest members. [VERIFIED: phase context and `models/rom.py`] | Code lifecycle repair. On authorized request, create a fresh verified component from the mapped source. This is a data write, not a migration of legacy `RomFile` rows. |
| Live service config | None inspected. The phase explicitly forbids production/Dev/NAS/permanent Docker access, so no external UI/database configuration is assumed or changed. [CITED: `49-CONTEXT.md`] | None. Keep the reproduction isolated. |
| OS-registered state | None found in repository inspection. No systemd, scheduled-task, process-manager, or similar state is in phase scope. [VERIFIED: codebase scope review] | None. |
| Secrets/env vars | None required or changed. The reproduction and implementation must not expose or create secrets. [CITED: `49-CONTEXT.md`] | None. |
| Build artifacts | No installed package or generated binary is part of the lifecycle defect. The generated OpenAPI model changes only if the response schema changes. [VERIFIED: codebase, `frontend/src/__generated__/models/FolderDownloadCapabilitySchema.ts`; [CITED: `CLAUDE.md`]] | Regenerate generated frontend types from the backend schema if the readiness contract changes. |

## Common Pitfalls

### Pitfall 1: The UI remains unreachable

**What goes wrong:** Restoring preparation inside POST alone does not fix legacy detail pages because the current GET with no FOLDER component omits the Game Download tab. [VERIFIED: codebase, `folder_download.py`, `GameDetails.vue`]

**How to avoid:** Publish a safe preparable state that permits the existing tab/action but never advertises members or transfer readiness. [RECOMMENDED]

### Pitfall 2: Bypassing mapping-version safety

**What goes wrong:** A request-time builder using an unscoped/global filesystem handler can operate outside the active mapping revision contract. [VERIFIED: codebase, `scan_handler.py`, `roms_handler.py`, `read_context.py`]

**How to avoid:** Resolve the active mapping for the ROM platform and use the existing mapped handler/context for every scan/hash open. Treat mapping changes, unreadability, and path failure as bounded preparation failure. [RECOMMENDED]

### Pitfall 3: Treating old `RomFile` data as a manifest

**What goes wrong:** Legacy rows record scan facts such as file path/name/size, but the existing whole-folder capability demands a complete FOLDER component with member SHA-256 evidence. [VERIFIED: codebase, `models/rom.py`, `folder_download.py`]

**How to avoid:** Rebuild the FOLDER component from current source checks, then let existing manifest code issue the immutable member records. [CITED: `49-CONTEXT.md`]

### Pitfall 4: Reconciliation drops PC components

**What goes wrong:** `reconcile_shared_download_inventory()` retains non-FOLDER components from the supplied `rom.components`; a stale snapshot can omit freshly written PC components before `sync_rom_components()` is called. This was the Phase 48 review's CR-01 finding. [VERIFIED: codebase, `scan_folder_download.py`, `scan_handler.py`; [CITED: `48-REVIEW.md`]

**How to avoid:** The preparation helper must reload the current ROM/components inside its existing persistence boundary before replacing the FOLDER group. Preserve existing PC components, archive sets, and media associations. [RECOMMENDED]

### Pitfall 5: Expanding scope to all platforms or sizes

**What goes wrong:** The current legacy PC/PS3 compatibility helper has platform-specific behavior, while the Phase 49 decision requires platform-neutral preparation only for authoritative known sizes at/above the threshold. [VERIFIED: codebase, `folder_download.py`; [CITED: `49-CONTEXT.md`]

**How to avoid:** Define the preparable predicate independently of legacy platform shortcuts, require known size and threshold for the new recovery path, and keep unknown/small sources unavailable. [RECOMMENDED]

## Code Examples

### Correct request-time lifecycle shape

```python
# Source: existing project patterns in download_manifests.py,
# scan_folder_download.py, roms_handler.py, and MappingReadContext.
assert_rom_visible(request, rom, not_found_detail=_NOT_FOUND)

if payload.whole_folder and shared_download_state(rom) is PREPARABLE:
    mapped_handler = FSRomsHandler.for_mapping(active_mapping)
    component = await build_shared_download_component(mapped_handler, rom)
    await persist_folder_component_from_current_rom(rom.id, component)
    rom = db_rom_handler.get_rom(rom.id) or raise_unavailable()

if payload.whole_folder and not is_shared_download_eligible(rom):
    raise ValueError("manifest folder inventory is unavailable")

# Existing create_manifest and browser queue continue unchanged.
```

This is intentionally pseudocode: the implementation must reuse the repository's concrete mapping lookup, error vocabulary, `ScanMediaBatch`, and component synchronization interfaces rather than introducing new copies. [RECOMMENDED]

## State of the Art

| Old/incorrect contract | Required current contract | Impact |
|---|---|---|
| `ensure_shared_download_inventory()` comment/usage implies a request may prepare inventory, but its body only rejects absent inventory. [VERIFIED: codebase, `scan_folder_download.py`, Git commit `4f9c610244`] | The helper must be split or renamed so validation-only and authorized preparation are unambiguous. [CITED: `49-CONTEXT.md`; [RECOMMENDED]] | Prevents the upgrade dead-end and avoids a misleading lifecycle name. |
| Detail capability is only transfer-ready/absent. [VERIFIED: codebase, `folder_download.py`] | Detail projection distinguishes transfer-ready, safely preparable, and unavailable without opening storage. [RECOMMENDED] | The established dialog becomes reachable for the upgrade case without claiming verified members prematurely. |

**Deprecated/outdated:** The PS3-named `ensure_ps3_download_inventory` alias and its comment are inaccurate as the shared lifecycle boundary. Replace them with names that state whether they validate existing inventory or prepare it. [CITED: `49-CONTEXT.md`; [VERIFIED: codebase, `scan_folder_download.py`, `download_manifests.py`]

## Resolved Mapping Contract

The endpoint-safe lookup is
`db_storage_handler.path_mapping(rom.platform_id, rom.full_path)`. It selects
the sole longest owning active mapping for the catalogued ROM path and raises
`MissingPlatformStorageMappingError` when none owns it. The preparation path
must construct `MappingReadContext(mapping.id, mapping.version)`, call
`validate()` before creating `FSRomsHandler.for_mapping(mapping, relative)`,
and let existing mapped-read errors produce the endpoint's bounded 409 failure
contract. This mirrors established mapped file and stream paths without using
the global scan handler. [VERIFIED: `storage_handler.py`, `roms_handler.py`,
`endpoints/roms/files.py`, `endpoints/streaming.py`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | A preparable state can be represented as an additive OpenAPI discriminator without breaking existing generated consumers. | Standard Stack | The API schema may need a separate additive field or a compatibility migration rather than a union change. |

## Open Design Choice

1. **What additive wire shape best retains current `folder_download` clients?**
   - What we know: the generated schema currently contains `source_kind`, `member_count`, and `total_size_bytes`, and the frontend treats presence as transfer-ready. [VERIFIED: codebase, generated schema, `GameDetails.vue`, `DownloadSelectionDialog.vue`]
   - What's unclear: whether a status field or a separate `preparable_folder_download` field produces the smaller compatibility change. [VERIFIED: codebase inspection]
   - Recommendation: prefer an additive field/state whose default preserves old ready clients, then regenerate types from OpenAPI. [RECOMMENDED]

## Environment Availability

No external dependency is required for research. Implementation's disposable fixture must use only a caller-provided descendant of `$TMPDIR`; the existing Phase 47 tool enforces that constraint and does not access configured storage. [VERIFIED: `backend/tools/ps3_folder_download_fixture.py`, `47-04-SUMMARY.md`]

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | pytest backend, Vitest frontend. [CITED: `CLAUDE.md`] |
| Config file | Existing repository test infrastructure. [CITED: `CLAUDE.md`] |
| Pre-UAT automated command | None permitted. [CITED: `49-CONTEXT.md`] |
| Allowed pre-UAT checks after implementation | Isolated one-off fixture evidence, static inspection, typecheck, scoped lint, production build. [CITED: `49-CONTEXT.md`] |

### Phase Requirements → Evidence Map

| Requirement | Behavior | Pre-UAT evidence | Human UAT evidence |
|---|---|---|
| UPG-49-01 | Legacy PS3 folder with `RomFile` rows but no FOLDER becomes reachable then transfer-ready only after authorized preparation | Disposable exact-baseline fixture plus static lifecycle inspection, no test changes/runs. | Desktop/mobile Game Download action creates the existing dialog/queue after preparation. |
| UPG-49-02 | ISO, other platform boundary, small, and unknown cases retain their established path | Fixture/static evidence only, no test changes/runs. | Verify specified controls/outcomes against a human-controlled Dev environment. |
| SAFE-49-01 | Unreadable, stale, unauthorized, and path-boundary cases fail closed | Fixture/static evidence only, no test changes/runs. | Verify bounded failure states against a human-controlled Dev environment. |
| DOC-49-01 | Lifecycle remains discoverable | Architecture documentation and static inspection. | Human handoff names expected controls/outcomes. |

### Wave 0 Gaps

No automated test work may be planned before human UAT. The plan must instead include a temporary, `$TMPDIR`-only exact-Beta14 reproduction harness/evidence procedure and remove it or retain it only under the stated temporary-file rules. [CITED: `49-CONTEXT.md`; [VERIFIED: `backend/tools/ps3_folder_download_fixture.py`]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | Yes | Existing protected manifest route and user-scoped manifest. [VERIFIED: codebase, `download_manifests.py`, manifest models] |
| V3 Session Management | Yes | Existing authenticated request/user-scoped manifest lookup. [VERIFIED: codebase, `download_manifests.py`, database manifest handler] |
| V4 Access Control | Yes | Visibility check occurs before preparation and again for member delivery. [VERIFIED: codebase, `download_manifests.py`] |
| V5 Input Validation | Yes | Existing Pydantic `whole_folder` selection validation and server-owned ROM/mapping paths. [VERIFIED: codebase, `endpoints/responses/download_manifest.py`, `read_context.py`] |
| V6 Cryptography | Yes | Existing SHA-256 evidence and manifest snapshot validation, never a custom checksum protocol. [VERIFIED: codebase, `folder_download.py`, `roms_handler.py`] |

### Known Threat Patterns for this lifecycle

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Client manufactures a source/member selection | Tampering | Accept only `whole_folder: true`; server resolves persisted/verified members after eligibility. [VERIFIED: codebase, request schema and manifest handler] |
| Mapping changes during preparation | Tampering / Denial of service | Bind source opens to `MappingReadContext` ID/version and fail closed on stale/unreachable mapping. [VERIFIED: codebase, `read_context.py`] |
| Legacy rows cause unverified delivery | Tampering | Never issue a manifest until the current source produced complete FOLDER SHA-256 evidence. [CITED: `49-CONTEXT.md`; [VERIFIED: codebase, capability predicate] |
| Unauthorized requester triggers source work | Elevation of privilege | Keep preparation after `assert_rom_visible`; return existing bounded error vocabulary only after visibility. [VERIFIED: codebase, `download_manifests.py`] |

## Sources

### Primary (HIGH confidence)

- [VERIFIED: codebase] `backend/endpoints/download_manifests.py` and `backend/handler/scan_folder_download.py` - current validation-only `ensure_*` path and manifest boundary.
- [VERIFIED: Git history] commits `4f9c610244` and `26148a6f1` - removal of on-demand preparation and subsequent misleading restoration comment.
- [VERIFIED: codebase] `backend/endpoints/responses/folder_download.py`, `backend/endpoints/responses/rom.py`, `frontend/src/v2/views/GameDetails.vue` - absent FOLDER inventory removes the current UI entry.
- [VERIFIED: codebase] `backend/handler/filesystem/folder_download.py`, `backend/handler/filesystem/pc_scan_inventory.py`, `backend/handler/storage/read_context.py`, `backend/handler/filesystem/roms_handler.py` - bounded builder and mapping/version safeguards.
- [CITED: repository] `AGENTS.md`, `CLAUDE.md`, `.planning/phases/49-za-beta14-upgrade-ohne-downloadinventur-reparieren/49-CONTEXT.md` - project and phase constraints.

### Secondary (MEDIUM confidence)

- [CITED: planning artifact] `.planning/phases/48-za-technische-beschreibungshinweise-entfernen-und-gemeinsame/48-REVIEW.md` - stale-snapshot reconciliation regression to guard against.
- [CITED: planning artifact] Phase 47 and 48 summaries/research - prior shared downloader boundaries and temporary fixture behavior.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, all required lifecycle components already exist in the codebase.
- Architecture: HIGH, the failure path is directly traceable from detail projection through UI gating to endpoint validation, and the removed behavior is present in Git history.
- Pitfalls: HIGH, most are direct current-code or prior-review findings; the exact endpoint-safe mapping lookup remains an explicit open question.

**Research date:** 2026-11-25
**Valid until:** 2026-12-02, because this is an active, fast-changing branch.
