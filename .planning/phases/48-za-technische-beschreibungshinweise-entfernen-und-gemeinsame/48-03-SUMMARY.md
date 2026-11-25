---
phase: 48-za-technische-beschreibungshinweise-entfernen-und-gemeinsame
plan: 03
subsystem: v2-game-download
tags: [vue, openapi, downloads, manifest]
requires:
  - plan: 48-02
    provides: Server-owned known-size shared-download capability and generated types
provides:
  - Capability-driven shared game-download entry point on every eligible platform
  - Documented direct-download fallback for ineligible and unknown-size sources
affects: [game-details, download-manifests, browser-download-queue]
tech-stack:
  added: []
  patterns:
    - Generated backend capability controls whole-source Game Download availability
key-files:
  created: []
  modified:
    - frontend/src/v2/views/GameDetails.vue
    - frontend/src/v2/components/GameDetails/PcComponents.vue
    - frontend/src/v2/components/GameDetails/DownloadSelectionDialog.vue
    - docs/FRONTEND_ARCHITECTURE.md
key-decisions:
  - Consume the generated capability directly without browser-side size or platform inference.
  - Retain the existing manifest dialog, manager, queue, enhanced fallback, and ordinary direct-download paths.
requirements-completed: [DL-48-03, DOC-48-01]
completed: 2026-11-25
---

# Phase 48 Plan 03: Capability-driven game download summary

**The v2 Game Download entry point now consumes the generated server-approved file or folder capability on every eligible platform while retaining existing PC component and ordinary direct-download paths.**

## Accomplishments

- Replaced the former PS3-specific visibility projection with the generated `FolderDownloadCapabilitySchema` consumer in `GameDetails`.
- Kept the existing `PcComponents`, `DownloadSelectionDialog`, manifest endpoint, `DownloadManager`, and browser queue as the single delivery path.
- Removed the obsolete client-side inventory-required state, so unknown or ineligible sources do not gain a shared-download action by inference.
- Documented that backend eligibility, not platform identity, controls the shared flow and that below-threshold or unknown-size sources keep ordinary download behavior.

## Task Commits

1. **Task 1: Consume the generated capability through the existing shared downloader** - `083800e0e` (`feat`)
2. **Task 2: Complete documentation and the permitted pre-UAT technical handoff** - `93ccde375` (`docs`)

## Verification

- Passed: `npm --prefix frontend run typecheck` after the UI integration.
- Passed: `cd frontend && npm run typecheck && npm run build && cd .. && trunk check frontend/src/v2/components/GameDetails/OverviewTab.vue frontend/src/v2/components/GameDetails/PcDlcDetail.vue frontend/src/v2/views/GameDetails.vue frontend/src/v2/components/GameDetails/PcComponents.vue frontend/src/v2/components/GameDetails/DownloadSelectionDialog.vue backend/endpoints/responses/folder_download.py backend/endpoints/responses/rom.py backend/handler/scan_folder_download.py backend/handler/filesystem/folder_download.py backend/handler/scan_handler.py backend/endpoints/download_manifests.py frontend/src/__generated__/models/FolderDownloadCapabilitySchema.ts frontend/src/__generated__/models/DetailedRomSchema.ts frontend/src/__generated__/index.ts docs/FRONTEND_ARCHITECTURE.md docs/BACKEND_ARCHITECTURE.md`.
- The production build emitted pre-existing stylesheet `:deep` syntax and dependency `eval` warnings, plus the existing chunk-size warning; it still completed successfully.
- No tests were created, modified, or run. No browser harness, browser inspection, deployment, database, or runtime service change was performed before live UAT.

## Human UAT

Perform these checks in the Dev browser at desktop and mobile widths:

1. Open a game with a German description, an English fallback description, and no description. Confirm normal game and PC DLC detail views show only the selected text or the ordinary empty state, without a technical source/language/provider notice.
2. Open the explicit localized-description editor for the same records. Confirm its provenance remains visible with its normal loading and error behavior.
3. On a non-PC/PS3 platform, verify authorized known-size single-file and folder games just below, exactly at, and above 4,000,000,000 bytes. Only exactly-at and above sources open the established Game Download dialog; unknown-size and below-threshold sources keep their ordinary download path.
4. Verify eligible single-file and folder downloads retain standard and enhanced-browser behavior, fallback, progress, cancellation, retry, and resume without exposing paths or member pickers for the bounded whole-source action.
5. Recheck existing PC component/archive-set and PS3 flows, a small ROM direct download, and Patcher reachability.

## Deviations from Plan

None - the generated contract was present and was consumed directly by the existing downloader surface.

## Known Stubs

None.

## Self-Check: PASSED

- Confirmed the generated capability model, UI integration files, and task commits `083800e0e` and `93ccde375` exist.
