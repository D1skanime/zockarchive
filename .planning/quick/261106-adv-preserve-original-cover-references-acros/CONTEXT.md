# Quick task context: persistent cover sources and active media managers

**Job:** 261103-4b37
**Parent phase:** 40-unify-pc-media-surfaces-and-complete-storybook-coverage
**Status:** in progress

## Human decisions

- A cover upload adds a candidate. It must never replace, hide, or delete the
  pre-existing original cover. Original cover data is retained as a separate,
  persistently stored reference and remains visible, selectable, and available
  to the cover gallery until explicitly deleted where deletion is permitted.
- A backwards-compatible, data-preserving migration is approved. It may only
  reconstruct old original references from reliable existing data; it must not
  invent an unavailable historical source.
- Main-game and component/DLC cover data remain strictly isolated. A sole
  uploaded cover remains deletable and cards use the same bounded responsive
  layout whether there are zero, one, or several candidates.
- Cover previews open the existing gallery at the clicked item. GIF and
  animated WebP cover candidates retain their animated source through upload,
  selection, display, gallery, and reload without relaxing size or safety
  limits.
- Media gets two explicit, shared management views: **Active backgrounds** and
  **Active overview images**. Each combines screenshot and artwork sources,
  identifies the source, previews through the existing gallery, persists its
  order, removes only that surface placement, and is reachable from the
  corresponding placement action. Background and overview placement are
  independent.
- Existing real library data is read-only for diagnosis. Mutating checks use
  only isolated synthetic targets. No full regression runs before human UAT.

## Known constraints

- Older rows that already overwrote a legacy main-game cover before this
  migration cannot be reconstructed unless a distinct source is still present.
- The task preserves existing provider non-reimport and explicit-delete rules.
- No Team4S resources, pushes, merges, or branch changes are in scope.

## Inventory

- `0144_active_cover_candidates` stores active owned-cover IDs but does not
  preserve the earlier main-game legacy cover path once a candidate is selected.
- `PcCoverMediaTab` already centralizes candidate rendering, deletion, bounded
  cards, and gallery preview, but its virtual legacy candidate is derived only
  from the mutable current cover paths.
- Main and component owned-media placement rows already carry a surface and
  position. Existing action cards can toggle placements but do not offer a
  dedicated, useful aggregation view.
