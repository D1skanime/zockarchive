---
quick_id: 261120-sd9
title: Fix confirmed Dev UAT scan and media failures
status: complete
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
- Earlier baseline checks in the then-served Dev instance confirmed that the
  Soundtrack setup crash no longer occurred at desktop and mobile widths. That
  instance still used the prior backend, so it was not evidence for the final
  backend media refresh path.

## Dev UAT handoff

The user requested automatic Dev deployment after this handoff and will perform
the browser UAT. No post-fix browser run was performed in this turn.

1. In `/scan`, scan the `Tales Of/Tales of Berseria` child, then run a Windows
   quick scan. The retired parent must not return or match as Tales of War or
   Total War; unrelated multi-game containers must remain supported.
2. On ROM 5500, refresh media after the IGDB association. Eligible screenshots
   and artwork must be published, while intentionally removed or suppressed
   media remains absent.
3. On ROM 36 at desktop and mobile widths, select an OST MP3, add it as a
   background and confirm advancing playback. In Game Download, the OST folder
   and an individual MP3 must support the regular download; also check the
   main-game download as a regression.

No tests were added or run before Live-UAT.
