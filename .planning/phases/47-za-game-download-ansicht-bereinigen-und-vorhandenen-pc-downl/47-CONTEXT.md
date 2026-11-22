# Phase 47: ZA Game Download cleanup and PS3 shared downloader - Context

**Gathered:** 2026-11-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove the parent metadata lookup and local-media review from the Game Download
surface only. Make folder-backed PS3 games eligible for the existing immutable
manifest, selection dialog, browser queue, progress, recovery and enhanced
directory-download flow, while preserving the existing ordinary single-file
console and PC download paths.
</domain>

<decisions>
## Implementation Decisions

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
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DownloadSelectionDialog`, `DownloadManager` and
  `useBrowserDownloadQueue` already implement mode selection, a bounded queue,
  transfer history and recovery.
- `POST /roms/{rom_id}/download-manifests` creates immutable, user-scoped
  manifests, and member delivery rechecks visibility and snapshot state.
- `PcComponents.vue` is the current UI composition point for the shared flow.

### Established Patterns
- `GameDetails.vue` owns route tab state and conditionally loads archive sets.
- Frontend uses generated backend response types, v2 primitives, i18n and the
  existing API adapter.
- Manifest delivery exposes opaque IDs and validated relative destinations,
  never a source path.

### Integration Points
- Generalize manifest eligibility and source inventory at the backend boundary.
- Move the UI composition from PC-only naming and platform gating to capability
  data provided by the detailed ROM response or a dedicated safe read endpoint.
- Update the Download section in `docs/FRONTEND_ARCHITECTURE.md` and the
  manifest/inventory section in `docs/BACKEND_ARCHITECTURE.md`.
</code_context>

<specifics>
## Specific Ideas

The supplied screenshot is an exact placement reference for the two actions,
not authorization to remove metadata or media features elsewhere.
</specifics>

<deferred>
## Deferred Ideas

None, discussion stayed within the requested downloader extension.
</deferred>
