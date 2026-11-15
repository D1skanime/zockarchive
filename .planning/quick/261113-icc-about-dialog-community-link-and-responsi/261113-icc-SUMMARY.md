---
quick_id: 261113-icc
title: Repair About dialog community attribution and responsive brand layout
status: complete
parent_phase: 44
completed: 2026-11-13
---

# Repair About dialog community attribution and responsive brand layout Summary

The About dialog no longer presents the upstream RomM Discord as a ZockArchive
community destination, and its product wordmark stays inside the 32-pixel tile
icon slot.

## Implementation

- Removed the unverified Community tile from the About dialog. Release, source
  code, and documentation tiles remain unchanged, and upstream attribution was
  not changed elsewhere.
- Sized and clipped only the `about` ProjectBrand variant to its parent icon
  slot. Navigation and authentication variants retain their existing dimensions.
- Product documentation does not need an update because the existing branding
  contract already records that there is no verified project community URL.

## Verification

- Authenticated Playwright inspection used the normal login form at 1440 px and
  390 px. On both viewports, the User menu opened the About dialog, each of the
  three remaining tiles opened its intended GitHub destination, and Escape
  closed then reopened the dialog.
- Both views displayed exactly three tiles, no Community, Discord, or RomM
  target, and no wordmark overflow beyond its version tile. The browser
  recorded zero console errors and zero failed requests after login.
- Screenshots and the short per-flow report are retained in the job evidence
  directory, outside the repository.
- `git diff --check` passed. No test or test suite was created, modified,
  weakened, or executed, as required before live acceptance.

## Deviations from Plan

None. The plan was executed exactly as written.

## Self-Check: PASSED

- `AboutDialog.vue` retains the three intended project links and no Community
  tile.
- `ProjectBrand.vue` limits only the About variant to its assigned slot.
