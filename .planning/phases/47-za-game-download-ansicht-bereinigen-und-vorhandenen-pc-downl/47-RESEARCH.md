# Phase 47: ZA Game Download cleanup and PS3 shared downloader - Research

**Researched:** 2026-11-22
**Domain:** Manifest-backed, bounded browser downloads for folder-backed console games
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Download eligibility and safety
- Reuse the existing server-owned manifest, inventory, visibility and safe path
  resolution boundaries. Do not introduce a direct source-file route.
- Model the UI from actual manifest/inventory availability, not a broad PC flag.
- Preserve every manifest destination exactly, including `PS3_GAME/USRDIR` and
  all sibling paths. A PS3 download must not require PC component classification.
- Keep standard and enhanced browser modes, including their existing feature
  detection, bounded queue, cancellation, retry and resume behavior.

### Game Download scope
- Remove `Metadaten suchen` and `Use local images` only from the displayed
  Game Download panel. Keep their dedicated metadata and media workflows.
- Expose the shared Game Download panel for eligible PS3 folder games. Retain
  Patcher and existing single-file/ISO console download behavior where a
  manifest-backed folder download is unavailable.
- Treat stale inventory, unavailable source and denied storage through the
  existing bounded manifest failure vocabulary.

### Verification and documentation
- Use an isolated synthetic PS3 folder fixture with at least 3,000 nested files
  for implementation evidence, without touching NAS data.
- Before live UAT, do not add or modify tests and do not run test suites. Run
  typecheck, lint and build only, then provide browser checks for the human.
- Document the shared download capability and its safety boundary in the
  affected architecture documentation.

### the agent's Discretion
Choose the narrowest generic inventory and capability representation that
preserves current API contracts and avoids duplicate resolver or queue logic.

### Deferred Ideas (OUT OF SCOPE)

None, discussion stayed within the requested downloader extension.
</user_constraints>

## Summary

The transfer implementation is already independent of the PC platform once it receives a `DownloadManifestResponse`. `useBrowserDownloadQueue` creates a transfer session, limits simultaneous work from deployment configuration, writes enhanced-mode files below a selected root only after validating each manifest destination, and retains cancellation, retry, resume, stale-source, checksum and progress behavior. [VERIFIED: codebase grep, `frontend/src/v2/composables/useBrowserDownloadQueue/index.ts`, `config.ts`]

The current restriction is at the capability and composition boundaries, not in the transfer protocol. `GameDetails.vue` exposes and loads the Game Download tab only for `isPcPlatform`, while `PcComponents.vue` assumes PC component labels and `DownloadSelectionDialog.vue` receives `PcComponentSchema[]`. The manifest endpoint itself accepts `RomComponent` / `RomComponentManifestMember` rows without checking the ROM platform. [VERIFIED: codebase grep, `frontend/src/v2/views/GameDetails.vue`, `PcComponents.vue`, `DownloadSelectionDialog.vue`, `backend/handler/database/download_manifests_handler.py`]

**Primary recommendation:** introduce a narrow, backend-owned folder-download capability based on complete persisted inventory evidence, then make the existing Game Download composition consume that capability for PC and eligible PS3 folders. Keep the existing ordinary ROM-file delivery and Patcher path untouched for ISO/single-file PS3 games.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Determine whether a folder ROM may be downloaded as a manifest | API / Backend | Database / Storage | Eligibility requires persisted inventory, visibility and storage-policy evidence, none of which is trustworthy in the browser. [VERIFIED: codebase grep, manifest handler and storage handlers] |
| Build and validate immutable member evidence | API / Backend | Storage | The filesystem handler hashes selected files, records structural identity, and rechecks it before streaming. [VERIFIED: codebase grep, `backend/handler/filesystem/roms_handler.py`] |
| Preserve PS3 relative destinations | API / Backend | Browser / Client | The backend emits trusted manifest destinations; enhanced mode validates the segments and creates only those directories under the selected root. [VERIFIED: codebase grep, manifest endpoint and `useBrowserDownloadQueue`] |
| Bound transfers, progress, cancellation and recovery | Browser / Client | API / Backend | The shared queue limits concurrent members using server configuration and persists transfer session events. [VERIFIED: codebase grep, queue composable and transfer APIs] |
| Choose Game Download versus Patcher | Browser / Client | API / Backend | The view should render from explicit capability data, while the backend remains the authority for whether the capability is available. [VERIFIED: codebase grep, `GameDetails.vue`, manifest route] |

## Project Constraints (from AGENTS.md)

- Work only in the canonical Linux checkout and preserve unrelated worktree changes. [VERIFIED: `AGENTS.md`]
- Backend response schemas are the API source of truth; regenerate frontend generated types after a response/route change. [VERIFIED: `CLAUDE.md`]
- Keep the endpoint, handler, database/filesystem layering and existing scope/visibility boundaries. [VERIFIED: `CLAUDE.md`, `.claude/skills/backend-development/SKILL.md`]
- New v2 behavior belongs under `frontend/src/v2`, uses generated backend types, strict TypeScript, existing primitives, i18n and the canonical queue. [VERIFIED: `CLAUDE.md`, `.claude/skills/frontend-v2-components/SKILL.md`]
- Update architecture/workflow documentation in the same implementation. [VERIFIED: `CLAUDE.md`]
- Do not add, modify, or run tests before live UAT. Only typecheck, lint and build are permitted pre-UAT. [VERIFIED: phase context and job instructions]
- Do not add a production monolith or duplicate resolver, inventory, queue, or downloader logic. [VERIFIED: `CLAUDE.md`]

## Existing Architecture and Required Change

### Current flow

```text
GameDetails PC platform check
  -> PcComponents / DownloadSelectionDialog
  -> POST /roms/{id}/download-manifests
  -> DB manifest handler locks persisted component/member rows
  -> filesystem handler captures hash + size + structural snapshot
  -> opaque manifest member URLs
  -> useBrowserDownloadQueue
     -> standard: bounded browser handoffs
     -> enhanced: bounded streaming writes below selected directory
  -> transfer session history / retry / resume
```

The request route first checks ROM existence and caller visibility. Manifest creation locks the ROM and selected persisted rows, rejects missing members or invalid hash evidence, captures immutable member evidence, and stores opaque public IDs rather than a source path. Member delivery repeats visibility and manifest-state checks, enforces snapshot preconditions for ranges, then opens a verified descriptor through the filesystem handler. [VERIFIED: codebase grep, `backend/endpoints/download_manifests.py`, `backend/handler/database/download_manifests_handler.py`, `backend/handler/filesystem/roms_handler.py`]

### Why PS3 folders are not eligible now

`RomComponent` and its manifest members are the current manifest source. They are populated by `FSRomsHandler.get_pc_components`, which invokes the PC-only top-level layout classifier during the Windows quick-scan flow. The scan inventory is complete only when bounded enumeration and revalidation succeed; its current maximum is 20,000 entries, depth 64 and a two-second inventory deadline. [VERIFIED: codebase grep, `backend/handler/filesystem/pc_scan_inventory.py`, `backend/handler/filesystem/roms_handler.py`, `backend/handler/windows_quick_execution.py`]

That makes a folder-backed PS3 game unavailable even though neither the manifest persistence model nor the queue protocol requires a PC platform. Reusing the PC layout classifier for PS3 would violate the requirement because it would assign PC-oriented DLC/install semantics to PS3 paths. [VERIFIED: codebase grep, classifier and manifest handler; requirement from phase context]

### Required capability contract

Add one explicit, generated API capability on detailed ROM data or a small safe read endpoint, for example a discriminated `folder_download` value containing availability and presentation-safe source inventory. It must not expose a storage path. The UI consumes `available` plus the generic selectable groups/members supplied by the backend, rather than calculating `isPcPlatform`. [RECOMMENDED, derived from verified architecture and locked phase decision]

For PC, map existing persisted component inventory into that capability without changing archive-set semantics. For PS3 folders, persist or expose a single generic folder inventory group with all recursively discovered relative members. It is presentation-neutral: no PC component classification, no metadata-media fields, no DLC rule and no synthetic installer category. Its members must be built only after the same complete, bounded inventory process succeeds. [RECOMMENDED, derived from verified architecture and locked phase decision]

Do not send 3,000 selected member IDs back from the dialog. `DownloadManifestCreateRequest.selected_member_ids` and archive-set membership are both capped at 100. A folder capability therefore needs an explicit whole-folder selection mode, resolved by the backend from the persisted group/inventory, while the existing PC component and archive-set selection requests remain compatible. [VERIFIED: codebase grep, `backend/endpoints/responses/download_manifest.py`, `backend/handler/database/download_archive_sets_handler.py`]

## Standard Stack

| Existing building block | Purpose in this phase | Required use |
|---|---|---|
| `DownloadManifest`, `DownloadManifestComponent`, `DownloadManifestMember` | User-scoped immutable manifest and opaque member identity | Extend/reuse its existing safe selection path, do not create a second delivery model. [VERIFIED: codebase grep, `backend/models/download_manifest.py`] |
| `FSRomsHandler` verification methods | Hash capture, safe source resolution, descriptor identity validation and bounded transfer concurrency | Generalize names/comments if needed, but retain the same code path for PS3 members. [VERIFIED: codebase grep, `backend/handler/filesystem/roms_handler.py`] |
| `useBrowserDownloadQueue` | Standard and enhanced browser delivery | Reuse unchanged. It already batches by server configuration and supports pause, cancellation, retry and resume. [VERIFIED: codebase grep, queue composable] |
| `DownloadSelectionDialog` / `DownloadManager` | Selection and session history UI | Generalize their data contract from PC labels/components to capability groups only; retain mode selector and transfer history. [VERIFIED: codebase grep, relevant Vue files] |
| Generated OpenAPI types | Frontend API contract | Regenerate after any response schema changes. [VERIFIED: `CLAUDE.md`] |

No external package is required. [VERIFIED: codebase analysis]

## Implementation File Map

| Area | Likely files | Change boundary |
|---|---|---|
| Generic inventory/capability | `backend/handler/filesystem/pc_scan_inventory.py`, `backend/handler/filesystem/roms_handler.py`, scan orchestration that currently calls `get_pc_components` | Extract a platform-neutral bounded folder inventory and a single generic group builder. Preserve PC-only `classify_components` for PC categorization. [RECOMMENDED] |
| Persisted member source | `backend/models/rom.py`, `backend/handler/database/roms_handler.py`, Alembic only if a distinct generic inventory entity is necessary | Reuse `RomComponentManifestMember` only if its semantic contract is widened in code/docs; otherwise add a minimal dedicated inventory entity. Never duplicate source resolver logic. [RECOMMENDED] |
| Manifest selection and failures | `backend/endpoints/responses/download_manifest.py`, `backend/handler/database/download_manifests_handler.py`, `backend/endpoints/download_manifests.py` | Add a bounded whole-folder selection that cannot be forged into arbitrary members. Extend bounded error codes for stale/unavailable generic inventory only. [RECOMMENDED] |
| ROM capability response | `backend/endpoints/responses/rom.py`, detailed-ROM serialization/query loading, generated frontend models | Publish availability and neutral groups/members, not source filesystem information. [RECOMMENDED] |
| Shared v2 composition | `frontend/src/v2/views/GameDetails.vue`, `PcComponents.vue` or a clearly renamed generic feature composite, `DownloadSelectionDialog.vue` | Remove only the in-panel metadata/local-image actions. Gate Game Download on capability; leave Patcher visible for non-capable console ROMs and preserve normal PC behavior. [VERIFIED: current composition; RECOMMENDED change] |
| Documentation | `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md` | Replace PC-only wording with the shared folder-download capability, including opaque manifest, safe relative destinations, fallback and no direct source path. [RECOMMENDED] |
| UAT fixture tooling | `backend/tools/` | Add a focused temporary-fixture helper only if implementation needs repeatable UAT setup. It must write under `$TMPDIR`, never to NAS/library mounts, and its keep path must be recorded in `$TMPDIR/ki-uat-keep.txt` if retained for UAT. [VERIFIED: repository and job instructions] |

## Safety Invariants

1. A browser never supplies or observes a storage source path. It chooses only server-issued IDs; member delivery resolves a persisted member under the owning ROM. [VERIFIED: codebase grep, manifest models and endpoints]
2. A manifest is user-scoped and member reads repeat ROM visibility validation. Unauthorized/non-visible resources remain masked as not found. [VERIFIED: codebase grep, `download_manifests.py`]
3. Every captured member has verified size, SHA-256 and a strong snapshot. Before delivery, descriptor size, mtime, device and inode are checked; changed/unavailable sources become stale rather than being delivered. [VERIFIED: codebase grep, filesystem handler]
4. Enhanced browser writes accept only safe manifest destinations and create directories below the user-selected root. `PS3_GAME/USRDIR/...` is preserved because the destination is `rom.fs_name + member.relative_path`; no flattening is permitted. [VERIFIED: codebase grep, `_download_manifest_destination`, `openDestination`]
5. Queue concurrency is deployment-owned, and enhanced members have inactivity protection. Never substitute `Promise.all` over all 3,000 files or issue unbounded browser clicks/fetches. [VERIFIED: codebase grep, queue composable]
6. Inventory failure must result in unavailable capability / bounded manifest error, never a partial guessed folder manifest. [RECOMMENDED, based on existing complete-inventory contract and locked decision]
7. Existing ordinary console file/ISO downloads remain on the mapped-content route. Do not route them through folder manifests merely because the platform is PS3. [VERIFIED: codebase grep, `backend/endpoints/roms/files.py`, `GameDetails.vue`; RECOMMENDED preservation]

## Common Pitfalls

### PC flag remains as an accidental authorization proxy

`isPcPlatform` currently controls both archive-set loading and tab rendering. Replacing only the tab condition leaves PS3 incapable of loading selection data; replacing only the fetch condition leaves Patcher hidden without a valid download surface. Use one explicit backend capability for both. [VERIFIED: codebase grep, `GameDetails.vue`]

### Sending every folder member as a selected ID

The request schema caps `selected_member_ids` at 100, so a 3,000-file folder cannot use the current per-member client selection payload. Whole-folder selection must be an authenticated backend operation over a persisted eligible group. [VERIFIED: codebase grep, response schema]

### UI explosion from file-by-file selection rendering

The dialog can render each existing manifest member as a checkbox. That is unsuitable for a 3,000-file PS3 group. Present the group as one folder download with count/total bytes and, at most, a deliberately bounded summary; keep detailed transfer progress in the existing manager. [VERIFIED: codebase grep, `DownloadSelectionDialog.vue`; RECOMMENDED]

### Reusing PC terminology as PS3 semantics

The current model/property names and labels are PC-specific. A generic capability must not invoke PC metadata matching or local media review, and must not infer DLC/installer status from PS3 paths. [VERIFIED: codebase grep, `PcComponents.vue`, `pc_metadata.py`; locked scope]

### Breaking folder topology through standard mode

Standard browser download cannot recreate nested folders itself. Preserve each member's manifest destination and clearly retain enhanced folder mode as the topology-preserving mode; keep existing feature detection/fallback rather than pretending standard mode reconstructs folders. [VERIFIED: codebase grep, standard anchor handoff versus enhanced `openDestination`]

## 3,000-File Synthetic Fixture Approach

Create a deterministic PS3 tree below a job-specific `$TMPDIR` directory, for example `.../PS3 Fixture/PS3_GAME/USRDIR/levels/<shard>/file-<n>.bin`, plus sibling files/directories. Generate at least 3,000 small files across multiple levels and retain a machine-readable expected manifest of `relative_path`, size and SHA-256 inside that same temporary tree. [RECOMMENDED]

Point only an isolated temporary mapping/test library at this tree, never a NAS path. The evidence command should compare the manifest response member count and destination-relative paths with the fixture's expected list, including `PS3_GAME/USRDIR`, then report aggregate counts and mismatches without printing secrets or source configuration. The implementation must not alter, rename, extract or write library files. [RECOMMENDED, constrained by job instructions]

The current 20,000-entry and depth-64 inventory bounds admit this fixture, but its two-second inventory deadline can be exceeded by VM load. Per job policy, a deadline-only timeout is not grounds to alter product code, enlarge budgets or repeat suites; record it as environmental if it occurs. [VERIFIED: codebase grep and job instructions]

If the fixture must remain for human UAT, add its relative temporary path as `path <relative path>` to `$TMPDIR/ki-uat-keep.txt` and report the dev address/port separately. Do not start a browser harness or browser test environment. [VERIFIED: job instructions]

## Validation Architecture

Pre-UAT validation is intentionally limited to `npm run typecheck`, relevant lint/format gate, and `npm run build` after generated types are refreshed. Do not create, modify or execute tests in this phase before live UAT, despite the repository's normal test policy. [VERIFIED: locked phase decision]

Human UAT should cover: desktop and mobile Game Download without the two misplaced actions; a 3,000-file PS3 folder in enhanced mode, showing bounded progress and pause/cancel/retry/resume; unsupported enhanced-mode fallback; PC regression; PS3 ISO/single-file regression; and stale inventory, denied storage and failed-member messages. [RECOMMENDED, locked acceptance requirements]

## Security Domain

| ASVS concern | Applicable control |
|---|---|
| Access control | `Scope.ROMS_READ`, user-owned manifests and repeat `assert_rom_visible` checks on manifest/member routes. [VERIFIED: codebase grep] |
| Path traversal | Only persisted relative paths are resolved; destination validation rejects absolute, dot and backslash segments. [VERIFIED: codebase grep] |
| TOCTOU / stale data | Hash capture plus snapshot and structural revalidation prevents serving a changed member as the captured one. [VERIFIED: codebase grep] |
| Resource exhaustion | Complete inventory bounds, transfer limiter, configured queue concurrency and enhanced inactivity timeout must remain active for PS3. [VERIFIED: codebase grep] |

## Documentation Updates Required

- In `docs/BACKEND_ARCHITECTURE.md`, replace PC-only manifest wording in Downloads and Key Abstractions with the shared folder-download capability, server-owned selection, complete inventory requirement and source-path prohibition. [VERIFIED: codebase grep]
- In `docs/FRONTEND_ARCHITECTURE.md`, describe Game Download as capability-driven, shared queue-based and enhanced-mode topology-preserving; state that metadata/local-media actions remain in their dedicated surfaces. [VERIFIED: codebase grep]
- Add concise domain comments only where generalized inventory/capability code has non-obvious ownership or safety boundaries. [VERIFIED: `CLAUDE.md`]

## Assumptions Log

| # | Claim | Risk if wrong |
|---|---|---|
| A1 | The narrowest compatible server contract can reuse persisted manifest component/member storage for one generic PS3 folder group without a migration. | The planner must inspect scan/persistence ownership and choose a dedicated inventory entity if model semantics cannot be widened safely. |
| A2 | The detailed ROM response is the best capability transport rather than a separate endpoint. | A dedicated safe read endpoint may reduce initial payload size; choose based on actual generated response and inventory loading cost. |

## Open Questions

1. **Where should a generic folder inventory be persisted in the existing scan lifecycle?**
   - What we know: PC components are produced only in the Windows quick-scan path, and manifest creation requires persisted members. [VERIFIED: codebase grep]
   - Recommendation: planner maps console folder scan orchestration and adopts the narrowest scan-time persistence hook. Do not calculate 3,000 hashes in a detail-page request.
2. **What should standard-mode copy say for folder downloads?**
   - What we know: enhanced mode reconstructs directory hierarchy while standard mode delegates separate files to the browser. [VERIFIED: codebase grep]
   - Recommendation: retain existing mode behavior and use clear localized copy; do not claim topology reconstruction in standard mode.

## Sources

- [VERIFIED: codebase grep] `frontend/src/v2/views/GameDetails.vue`, `PcComponents.vue`, `DownloadSelectionDialog.vue`, `DownloadManager.vue`, `useBrowserDownloadQueue/index.ts`
- [VERIFIED: codebase grep] `backend/endpoints/download_manifests.py`, `backend/handler/database/download_manifests_handler.py`, `backend/models/download_manifest.py`
- [VERIFIED: codebase grep] `backend/handler/filesystem/roms_handler.py`, `backend/handler/filesystem/pc_scan_inventory.py`, `backend/handler/database/roms_handler.py`
- [VERIFIED: codebase grep] `backend/endpoints/roms/files.py`, `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md`, `CLAUDE.md`, `AGENTS.md`

## Metadata

**Confidence breakdown:**
- Existing stack and safety boundaries: HIGH, directly inspected implementation.
- PS3 capability architecture: MEDIUM, the required generic scan persistence hook needs targeted planner inspection.
- UI and transfer reuse: HIGH, the existing queue and PC-only gates are directly inspected.

**Research date:** 2026-11-22
**Valid until:** 2026-12-22
