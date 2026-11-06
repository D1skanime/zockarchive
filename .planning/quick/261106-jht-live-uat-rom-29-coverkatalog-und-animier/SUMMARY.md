---
quick_id: 261106-jht
status: complete
parent_phase: 40
commit: recorded in Git history
---

# Summary: ROM 29 cover catalog and animated hero repair

## Implementation

- The main-game detail hero now uses the authenticated content URL of an active
  owned Cover candidate. It no longer renders an unrelated generated
  `path_cover_*` derivative, so the persisted selection is also the actual
  hero source and animated GIF/WebP bytes are retained.
- Migration 0146 preserves a current legacy cover reference only for ROMs whose
  three original-source fields were all empty. It copies existing references,
  creates no file, changes no candidate, and cannot reconstruct a source that
  is no longer present.
- The browser diagnosis of ROM 29 confirmed candidate `645` as active while
  the hero used a different PNG derivative. After migration it exposes both
  the recoverable legacy source and the active candidate in the Cover catalog;
  the hero uses candidate `645` directly.

## Targeted verification

- Read-only authenticated desktop and mobile inspection of `/rom/29?tab=media`
  confirms two visible Cover cards, a selectable active candidate, and a hero
  source of `/api/roms/29/media/645/content` rather than the prior `big.png`
  derivative. Screenshots: `quick-261106-jht-rom29-cover-desktop.png` and
  `quick-261106-jht-rom29-cover-mobile.png`.
- Disposable synthetic Main and DLC owners used normal browser upload, Cover
  gallery preview, selection and reload for GIF and WebP. For every selected
  cover, the actual rendered hero source matched its selected owner path and
  repeated browser paints changed across time. The active ID remained in its
  owner-scoped catalog after reload. The disposable ROM and all 16 owned files
  were removed afterwards.
- No test suite was run, as instructed for this live-UAT correction.

## Limits

Migration 0146 can retain a currently available legacy path only. It does not
invent a missing pre-existing original or recover media that has already been
deleted from storage.
