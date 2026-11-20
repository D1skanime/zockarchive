---
quick_id: 261120-ftg
title: Restore changed-file line-limit baselines
status: complete
---

# Restore changed-file line-limit baselines

## Outcome

- Moved manual IGDB media retention and suppression-aware catalog publication from the ROM endpoint into the existing `handler/metadata/rom_media.py` owner. The endpoint returns to its 2,323-line baseline without changing the update contract.
- Moved local OST playlist construction and version-checked selection mutation from `SoundtrackPanel.vue` into `useLocalSoundtrackPlaylist.ts`. The panel keeps the same authorized local-file route and regular manifest-backed download boundary.
- Kept the IGDB description fallback at the ROM-owning overview and resolver call sites while returning `OverviewTab.vue` and `GameDetails.vue` to their reported baselines.

## Verification

- `npm --prefix frontend run typecheck` passed.
- Targeted Trunk checks passed for the changed backend and frontend source files.
- `git diff --check` passed. No test suite was run before Live-UAT.
- Final source counts: `backend/endpoints/roms/__init__.py` 2,323, `OverviewTab.vue` 751, `SoundtrackPanel.vue` 587, and `GameDetails.vue` 563 lines. Existing untouched legacy files remain recorded as baseline debt.

## Documentation

`docs/BACKEND_ARCHITECTURE.md` now identifies `handler/metadata/rom_media.py` as the owner that republishes retained manual-IGDB media. The existing frontend architecture description already documents the local-OST versus regular-download boundary, so no behavior documentation changed.
