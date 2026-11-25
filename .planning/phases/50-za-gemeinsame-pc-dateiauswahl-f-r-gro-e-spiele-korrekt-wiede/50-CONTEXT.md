# Phase 50: Shared PC member selection for large games - Context

**Gathered:** 2026-11-25
**Status:** Ready for planning
**ki-run job:** `261125-ef23`

<domain>
## Phase Boundary

The shared Game Download dialog must expose every verified member of an eligible
neutral FOLDER inventory through the established PC member-selection, immutable
manifest, and bounded browser-queue lifecycle. It must not add a console
downloader, a duplicate list, an alternate resolver, or a source-path bypass.
</domain>

<decisions>
## Locked Decisions

- Eligibility is one inclusive game-total rule at 4,000,000,000 bytes. It is evaluated before selection, never per file or from the reduced selection.
- All 564 and 3,000 verified members remain selectable. The request limit must be increased to a deliberate bounded maximum with positive, unique opaque IDs, never silently truncating a selection or accepting arbitrary IDs.
- A ready neutral FOLDER inventory uses the same selectable member contract as PC components. Manifest membership must exactly equal the submitted selection.
- A legacy preparable source remains non-transfer-ready until the existing authorized preparation boundary has verified and persisted FOLDER members. Detail reads remain non-mutating; the UI must show preparation/error state, not a silent empty list or blind transfer.
- Permission, mapping revision, mapped paths, source snapshots, ownership and stale/unreadable rejection remain server-owned. FOLDER member IDs are checked against the selected ROM-owned verified component.
- Existing archive-set behavior, PC component classification, ISO/single-file, standard/enhanced mode and browser capability fallback remain unchanged.
</decisions>

<code_context>
## Root Cause and Reusable Assets

- `DownloadSelectionDialog.vue` defines `isWholeFolder` from capability presence, then hides the existing file list and clears `selectedMemberIds`.
- `PcComponents.vue` serializes every `wholeFolder` action as only `{ whole_folder: true }`.
- `DownloadManifestCreateRequest` and `DBDownloadManifestsHandler` reject member IDs in whole-folder mode, while the existing normal component branch already validates ownership and emits an exact selected-member manifest.
- Phase 49 persists a neutral verified FOLDER component and uses the same dialog/queue but deliberately excluded FOLDER members from the UI projection.
</code_context>

<deferred>
## Deferred Ideas

No deployment, merge, push, new downloader, filesystem API requirement, unbounded request, scan reset, database reset, NAS access, or new tests before human UAT belongs to this phase.
</deferred>
