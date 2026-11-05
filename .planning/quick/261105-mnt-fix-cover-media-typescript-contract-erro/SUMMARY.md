---
quick_id: 261105-mnt
status: complete
phase: 40
completed: 2026-11-05
---

# Quick 261105-mnt: Cover media contract and size-gate repair

The Cover composite now receives explicit cover-only candidates for both ROM
and component owners, while refresh callers use their actual boolean result.

## Gate corrections

- `MediaManagement.stories.ts` now supplies every generated component-owned
  media field with synthetic data.
- `MediaTab.test.ts` supplies the production `Promise<boolean>` refresh
  contract rather than weakening the component prop.
- `MediaTab.vue` and `PcDlcMediaTab.vue` project only `cover` records into
  the shared Cover target. Component-only roles cannot cross the owner boundary.
- `GameDetails.vue` returns the authoritative refresh success result and uses
  a void adapter only for legacy event consumers.

## Structural boundaries

- `pc_component_manual_resources.py` owns preserved component-manual routes;
  the bounded media router includes it unchanged.
- `pc_component_media_mutations.py` owns component Cover selection, including
  its versioned component and user membership checks.
- `pc_component_media.py` owns the common versioned Cover-selection request
  and is re-exported by the ROM response catalog for API compatibility.
- `gameDetails.css` owns the details-view layout styles.

## Verification

- `cd frontend && npm run typecheck` passed with no diagnostics.
- `git diff --check` passed.
- Physical line counts: `rom.py` 1179 (baseline 1184),
  `roms_handler.py` 4834 (baseline 4853), `GameDetails.vue` 577
  (baseline 686), and `pc_component_resources.py` 384 (limit 450).

No tests were added and no frontend, browser, or backend test suite was run,
as required before renewed human UAT.

## Commits

- `9759e2a25` fix: align cover media TypeScript contracts
- `741e02e1b` refactor: isolate component manual routes
- `3977d86eb` refactor: isolate game details layout styles
- `e545c5a14` refactor: move component cover selection boundary

## Self-Check: PASSED

The summary exists and all listed commits are present on the active branch.
