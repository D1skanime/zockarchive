---
quick_id: 261120-sd9
title: Fix confirmed Dev UAT scan and media failures
status: blocked
completed: 2026-11-20
---

# Summary

## Implemented

- An explicitly selected Windows collection child now bypasses quick-inventory
  reuse and reaches the existing completion fence. Its parent is retired before
  a later quick scan can rediscover and metadata-match the container.
- SoundtrackPanel initializes its local playlist before any computed playback
  state reads it, eliminating the reported temporal-dead-zone exception.
- Explicit media refresh now restores the retained IGDB image inventory for an
  older manual match that has an `igdb_id` but no `provider_media` inventory.
  The existing reconciliation and durable provider-media suppression rules then
  remain the single publication path.
- The PC-release row no longer renders a generic first-release value as a PC
  release for a console ROM.

## Verification

- `npm run typecheck` passed.
- Targeted `trunk check` passed.
- The isolated production frontend build passed. Existing third-party CSS and
  chunk-size warnings remained non-fatal.
- The supplied Dev login worked in headless Chromium at 1440 px and 390 px.
  `/rom/36?tab=media&subtab=soundtrack` rendered without the
  `localSoundtrack before initialization` error. Evidence:
  `uat-soundtrack-desktop.png` and `uat-soundtrack-mobile.png`.
- The currently served Dev backend still had the prior commit: ROM 5500 exposed
  `igdb_id=431`, an empty retained provider inventory, zero provider screenshot
  URLs, and only cover catalog rows after Refresh. This is the exact stale-data
  case addressed by this task, but it cannot validate the new backend path
  before the authorized UAT deployment updates Dev. Evidence:
  `uat-uncharted-media-desktop.png` and `uat-uncharted-media-mobile.png`.

## Blocker

The authorized command `/home/d1sk/ki-run/bin/ki-run uat 261116-ffb0` was
refused with: `Diese Aktion ist aus einem KI-Auftrag heraus gesperrt.` Manual
Dev deployment is outside this task's authorization. Therefore the exact
post-fix browser paths remain open: the Tales selected-child scan followed by
quick scan, the restored Uncharted screenshots/artwork refresh, and OST MP3
selection, playback, and individual download with an available local fixture.

No tests were added or run before Live-UAT.
