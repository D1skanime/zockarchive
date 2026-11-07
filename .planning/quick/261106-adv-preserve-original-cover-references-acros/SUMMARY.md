---
quick_id: 261106-adv
status: implementation_complete_pending_uat
parent_phase: 40
---

# Summary

## Implemented

- Added migration `0145_preserve_original_cover_source`, storing a parent ROM's
  reliable original paths and URL independently from its active owned cover.
  New selections preserve this source; deleting an active candidate or choosing
  the original restores it. Historical rows with no separately recoverable
  source remain explicitly unreconstructed.
- GIF and WebP cover inputs now retain their validated source bytes instead of
  being flattened through cover derivatives. The UI accepts GIF uploads and
  cover previews use the shared gallery.
- Added bounded shared active-placement management composites and the visible
  `Active backgrounds` and `Active overview images` tabs for parent and
  component media. They aggregate screenshots and artwork by owner/surface,
  show source, preview with the shared carousel, reorder persisted placements,
  and remove a placement without deleting media. Artwork no longer renders an
  inert duplicate background list.
- Updated Storybook data and architecture documentation for the cover source,
  animation, and placement-manager contracts.

## Verification

- `npm run typecheck` passed after the changes.
- Scoped `trunk fmt` and `trunk check` passed for the affected files.
- The authenticated browser reached the test instance, but both supplied
  `/rom/24` and `/rom/24/dlc/20` URLs rendered a product 404 there. Therefore
  no claim is made for live clicks, uploads, persistence, or gallery behavior
  against those reference records in this run.

## Deliberate limits

- No new test was written and no full regression suite was run, per the
  pre-UAT instruction.
- A source that was already overwritten before migration 0145 is not invented
  or claimed restored when the database has no reliable remaining reference.
