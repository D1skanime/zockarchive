---
quick_id: 261106-jht
title: ROM 29 Cover catalog and animated hero repair
status: in_progress
parent_phase: 40
mode: full
depends_on: []
wave: 1
---

# ROM 29 Cover catalog and animated hero repair

## Observed production state

Read-only browser inspection of `/rom/29?tab=media` found an active owned Cover
candidate (`645`) whose content differs from the detail-page hero. The persisted
active selection is therefore correct at the catalog boundary, but the main-game
hero still follows the old derived `path_cover_*` file. That path is a PNG and
cannot preserve an animated source. The same ROM has no retained
`original_cover_*` reference, so its existing legacy hero source cannot be shown
as a separately managed original candidate.

## Wave 1

1. Route an active main-game owned Cover through its authoritative protected
   content endpoint for the detail hero. This preserves GIF/WebP bytes and makes
   the selected catalog item, rather than a stale derivative, the visible cover.
2. Add a data-preserving migration that records an existing current cover source
   only when all original-cover fields are absent. It does not manufacture a
   missing asset, alter candidate ownership, or replace an explicit selection.
3. Update the cover data-flow documentation and phase verification reference.
4. Use synthetic owned GIF/WebP covers through the actual upload, selection,
   reload and hero path for main and DLC. Read ROM 29 only. Inspect desktop and
   mobile production media UI, including candidate preview and the hero source.

## Acceptance

- An active parent-owned cover is rendered from `/api/roms/{id}/media/{id}/content`.
- The active candidate remains visible in the Cover catalog and is the exact hero
  source after reload; GIF/WebP animation is not flattened by a cover derivative.
- Existing rows that have a current cover but no original reference retain that
  existing source as a recoverable original reference without inventing files.
- Main-game and DLC owner boundaries remain independent.
