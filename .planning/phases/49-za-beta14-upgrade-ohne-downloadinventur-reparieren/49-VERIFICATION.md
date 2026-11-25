---
phase: 49-za-beta14-upgrade-ohne-downloadinventur-reparieren
verified: 2026-11-25T17:40:47Z
status: human_needed
score: 6/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Inspect the preserved Phase 49 reproduction receipt or rerun the disposable exact-Beta14 fixture outside this verification pass."
    expected: "It proves persisted RomFile-only folder facts, zero FOLDER components/manifests/members, all declared boundary rejections, and cleanup without touching real storage."
    why_human: "The planned temporary fixture and receipt were intentionally removed. The remaining SUMMARY is an assertion, not durable evidence."
  - test: "On desktop and mobile, open a legacy eligible PS3 folder ROM with RomFile rows but no FOLDER inventory, then choose Game Download."
    expected: "The existing tab and dialog are reachable without an aggregate count or byte total; clicking performs the existing whole-folder request, displays loading, then queues only the returned manifest."
    why_human: "Browser interaction, responsive presentation, and a real authorized storage preparation are explicitly forbidden in this pre-UAT verification."
  - test: "Exercise ready PC and PS3 folders, PS3 ISO/single-file, below/exactly-at/above-threshold other-platform sources, and denied, stale, unreadable, and path-boundary cases."
    expected: "Ready flows retain their dialog, queue, progress, cancel, retry, resume, and fallback behavior. Non-ready or rejected cases retain ordinary delivery or bounded server failures without data exposure."
    why_human: "The phase forbids browser/runtime testing; source inspection cannot establish these end-to-end behaviors."
---

# Phase 49: ZA Beta14 Upgrade without Download Inventory Repair Verification Report

**Phase Goal:** Safely restore the existing shared Game Download lifecycle for eligible Beta14-upgraded libraries that retain ordinary `RomFile` records but lack the later verified FOLDER inventory, without a rescan, storage bypass, new downloader, or detail-read mutation.
**Verified:** 2026-11-25T17:40:47Z
**Status:** human_needed
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The Beta14 upgrade condition is reproduced from the exact `be0e4ee888d58008f19f8eb1fbd7ee929cbe676a` baseline without a seeded FOLDER component. | ? UNCERTAIN | The temporary artifact was designed to be removed. No durable receipt or harness remains to inspect, and `49-01-SUMMARY.md` is not accepted as evidence. Baseline source does show that the old projection required a persisted FOLDER component. |
| 2 | The reproduction distinguishes the legacy PS3 folder from the listed single-file, threshold, unknown, unreadable, stale, unauthorized, and path-boundary cases without real library data. | ? UNCERTAIN | The only claimed execution evidence is the removed temporary fixture summarized in `49-01-SUMMARY.md`. Current source does fail mapping, path, storage, and inventory errors closed, but it cannot prove the fixture's declared matrix was executed. |
| 3 | A legacy eligible folder is preparable, never transfer-ready, and Detail GET neither reads nor mutates source state. | ✓ VERIFIED | `shared_download_preparation_capability()` uses persisted ROM/component facts only, requires known size at or above 4 GB, excludes single files and existing FOLDER components, and emits `state="preparable"`; `prepare_folder_download_details()` only projects that response at `rom.py:857` and `1021`. |
| 4 | An authorized whole-folder request prepares only a current mapped, size-eligible legacy source, then uses the existing manifest issuer and transfer path. | ✓ VERIFIED | `create_download_manifest()` calls `assert_rom_visible()` before preparation, then invokes `_prepare_shared_download_inventory()` only for `is_shared_download_preparable()` and passes the reloaded ROM to existing `db_download_manifest_handler.create_manifest()`. The mapped handler is built with `path_mapping`, `MappingReadContext(mapping.id, mapping.version).validate()`, and `FSRomsHandler.for_mapping()`. |
| 5 | Unknown, stale, unreadable, unauthorized, below-threshold, and invalid-path sources fail closed without synthetic members or paths. | ✓ VERIFIED | Unknown/below-threshold/single-file/missing states cannot become preparable (`folder_download.py:106-120`); authorization precedes preparation; mapping/storage/inventory failures are translated to the bounded `manifest_folder_inventory_unavailable` response. `build_shared_download_component()` produces members only after bounded inventory and hash verification. |
| 6 | A preparable source reaches the existing Game Download entry and established loading/error/queue action. | ✓ VERIFIED | `GameDetails.vue` exposes the tab for any server capability and passes it to `PcComponents`; `DownloadSelectionDialog` emits the existing `wholeFolder` action; `PcComponents` posts only `{ whole_folder: true }`, retains queue handoff, and adds preparation loading plus its existing snackbar error path. |
| 7 | Only ready inventory renders verified count and size; preparable inventory is not rendered as a manifest or member list. | ✓ VERIFIED | The generated state discriminator drives `folderDownloadIsReady`; `DownloadSelectionDialog.vue:177-183` renders member count and total only when ready. Preparable mode emits no selected members/components, while server preparation uses a source verification builder before manifest issuance. |
| 8 | Existing PC, PS3 ISO/single-file, direct-download, dialog, queue, progress, cancel, retry, resume, and enhanced fallback lifecycles remain on their existing path. | ✓ VERIFIED | The Phase 49 diff confines frontend behavior to the generated state discriminator, ready-only aggregate display, and preparation loading. It preserves the existing POST, `useBrowserDownloadQueue`, standard/enhanced branches, `DownloadManager`, cancellation/retry/resume callbacks, and direct paths. Runtime behavior remains in the required human UAT. |

**Score:** 6/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `$TMPDIR/za49-beta14-reproduction` | Disposable baseline fixture and sanitized evidence | ⚠️ UNVERIFIABLE | Correctly absent after planned cleanup, but no retained sanitized receipt permits independent verification of the claimed run. |
| `backend/endpoints/responses/folder_download.py` | Read-only ready/preparable projection | ✓ VERIFIED | 146 substantive lines. `ready` remains based on a complete hashed FOLDER inventory; `preparable` has no source walk, hash, write, or path access. Wired by `prepare_folder_download_details()`. |
| `backend/endpoints/download_manifests.py` | Authorized prepare, reload, then existing issue lifecycle | ✓ VERIFIED | 382 substantive lines. Visibility check is before preparation; it binds to the active mapping/version, reloads the ROM, validates inventory, and calls the established database issuer. |
| `backend/handler/scan_folder_download.py` | Mapped-source inventory preparation seam | ✓ VERIFIED | 129 substantive lines. The new helper receives rather than selects a mapped handler and persists only the builder's verified FOLDER component through `sync_rom_components()`. |
| `frontend/src/v2/views/GameDetails.vue` | Generated server state drives reachability | ✓ VERIFIED | The existing Game Download tab is driven by `folder_download`, passed to `PcComponents`, and does not perform client eligibility inference. |
| `frontend/src/v2/components/GameDetails/PcComponents.vue` | Existing POST/action handles preparation | ✓ VERIFIED | Uses the existing manifest endpoint and queue. `preparingFolderDownload` wraps only a preparable whole-folder action and is cleared in `finally`. |
| `frontend/src/v2/components/GameDetails/DownloadSelectionDialog.vue` | Ready-only aggregate presentation | ✓ VERIFIED | `folderDownloadIsReady` gates the count/size checkbox; preparable sources still emit the existing whole-folder action without a member list. |
| `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md` | Discoverable server and UI lifecycle | ✓ VERIFIED | Both documents describe `ready` versus `preparable`, read-only detail projection, POST-only preparation, and the reused dialog/queue/manifest lifecycle. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `download_manifests.py` | `scan_folder_download.py` | Authorized whole-folder POST after `assert_rom_visible` | ✓ WIRED | Import plus awaited `prepare_shared_download_inventory(rom, mapped_handler)` within `create_download_manifest()`. |
| `scan_folder_download.py` | `FSRomsHandler.for_mapping` and `MappingReadContext` | Current mapping ID/version-bound builder | ✓ WIRED | Endpoint resolves mapping, validates `MappingReadContext`, constructs `FSRomsHandler.for_mapping`, then passes it to the builder. The handler revalidates mapping context on each inventory access. |
| `GameDetails.vue` | generated folder-download schema | Server-generated readiness discriminator | ✓ WIRED | `currentRom.folder_download` is typed as `FolderDownloadCapabilitySchema`, controls tab reachability, and is passed to the existing feature component. |
| `PcComponents.vue` | `/api/roms/{id}/download-manifests` | Existing `whole_folder: true` POST and browser queue | ✓ WIRED | The sole whole-source branch posts `{ whole_folder: true }`; its response is sent to `queue.start` or `queue.startEnhanced`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `folder_download.py` | `rom.folder_download` | Persisted ROM/component facts | Yes, projection derives state from ORM facts only | ✓ FLOWING |
| `download_manifests.py` | Manifest response | Current mapped source inventory, reconciled persisted component, existing manifest issuer | Yes, builder hashes verified current files before issuance | ✓ FLOWING |
| `GameDetails.vue` / `PcComponents.vue` | `folderDownload`, manifest response | Generated detailed-ROM response and existing manifest POST | Yes, response controls tab/action and returned manifest enters existing queue | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Runtime/API/browser behavior | Not run | Explicitly forbidden by Phase 49 validation boundary and parent task | ? SKIPPED |

### Probe Execution

No Phase 49 probe was declared, and no `scripts/**/tests/probe-*.sh` probe was discovered. No probe execution was required.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| UPG-49-01 | 49-02, 49-03 | Legacy no-FOLDER source becomes reachable and transfer-ready only after authorized preparation | ? NEEDS HUMAN | Source-level lifecycle is wired; exact baseline reproduction receipt and desktop/mobile action remain unverified. |
| UPG-49-02 | 49-02, 49-03 | Boundary sources retain their ordinary or rejected path | ? NEEDS HUMAN | Fail-closed predicates and bounded errors are present; required runtime boundary matrix was not run here. |
| UPG-49-03 | None | No description is defined in `REQUIREMENTS.md`, `49-VALIDATION.md`, or plan requirements metadata | ? NEEDS HUMAN | ROADMAP names this ID, but no plan claims it and no canonical requirement text exists. Developer decision is required before it can be verified. |
| SAFE-49-01 | 49-02, 49-03 | Unreadable, stale, unauthorized, and path-boundary failures fail closed | ✓ SATISFIED (source-level) | Visibility ordering, mapping-version validation, normalization, and bounded failure conversion are in the manifest path. Runtime confirmation remains UAT. |
| DOC-49-01 | 49-02, 49-03 | Lifecycle is documented with a human UAT handoff | ✓ SATISFIED | Both architecture documents describe the actual ready/preparable and authorized-POST boundaries; summary supplies UAT cases without claiming browser proof. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| Phase 49 product and documentation files | n/a | No `TBD`, `FIXME`, or `XXX` debt markers found | ℹ️ Info | No audit-blocking debt marker. |
| `folder_download.py` | 125-126 | `preparable` serializes zero members plus known persisted source size | ℹ️ Info | This is not a synthetic manifest or rendered aggregate. The dialog gates count/size on `state === "ready"`; retain this distinction in UAT/API review. |

### Human Verification Required

### 1. Recover or rerun the disposable baseline reproduction

**Test:** Inspect the retained receipt, if one exists outside the repository, or rerun the exact-baseline disposable fixture.
**Expected:** It proves the no-FOLDER migration condition and all declared boundaries without real-library interaction or retained temporary data.
**Why human:** The planned cleanup removed the only runtime evidence, so the remaining summary cannot prove it occurred.

### 2. Verify legacy preparation in the browser

**Test:** On desktop and mobile, open an eligible legacy PS3 folder ROM and invoke the existing Game Download action.
**Expected:** No count/size is shown before preparation; the existing loading, error, dialog, manifest, and queue flow proceeds only after the authorized click.
**Why human:** Browser and real mapped-source checks are prohibited before human UAT.

### 3. Verify compatibility and rejection cases

**Test:** Exercise ready sources and each documented boundary/rejection source.
**Expected:** Existing delivery behavior is retained for valid sources; invalid sources reveal no inventory and produce only the bounded error path.
**Why human:** Source inspection cannot prove responsive controls, queue behavior, or real storage error handling.

## Gaps Summary

No source-level BLOCKER was found in the implemented lifecycle. The phase cannot be marked passed because its temporary reproduction has no independently inspectable evidence, `UPG-49-03` has no defined/claimed requirement coverage, and all browser/runtime acceptance remains deliberately deferred to human UAT. This is an Escalation Gate, not permission to infer a pass from the summaries.

---

_Verified: 2026-11-25T17:40:47Z_
_Verifier: the agent (gsd-verifier)_
