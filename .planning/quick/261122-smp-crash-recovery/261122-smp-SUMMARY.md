---
quick_id: 261122-smp
title: Make scan-media crash recovery deterministic
status: complete
---

# Scan-media crash-recovery repair

## Result

The review finding was confirmed. A persisted advisory directory cursor can
finish before a newly terminal crash receipt. The former recovery invocation
then ended without a fresh traversal, leaving private crash output for the
next scheduled cleanup pass.

`RecoveryWalk` now records whether it resumed a saved cursor. When that cursor
finishes, recovery makes one fresh traversal from the reserved receipt root in
the same 512-step budget. It does not change the manifest, proof, ownership,
writer-fence, or cleanup authority checks. Only one restart is permitted.

The two RetroAchievements counter failures were rechecked as part of the
previous exact Gate-51 subset and did not reproduce. They are unrelated to
scan-media recovery and need no speculative code change.

## Verification

- `trunk check backend/handler/filesystem/scan_media_traversal.py backend/handler/filesystem/scan_media_recovery.py` passed.
- The isolated MariaDB target passed the prepared, streamed, published, and
  committed crash boundaries plus recovery cursor budget and continuity:
  `6 passed`.
- Browser inspection after normal form login opened `/scan`; the scan-type
  control was operated and the post-login console and network had no errors.
  Screenshot: `screens/review-scan-media-recovery-desktop.png`.

## Documentation

`docs/BACKEND_ARCHITECTURE.md` now documents the one fresh bounded pass after
a resumed cursor reaches its end.
