---
phase: 46-za-beta-5-nas-uat-diagnose-und-h-rtung-der-terminalen-owned-
verified: 2026-11-16
status: partial
---

# Phase 46 Verification

## Verdict

**Partial. Do not mark Phase 46 complete.** The archive-timeout correction and
the owned-proof timeout cause are addressed, but the blocked production build
and full post-fix isolated UAT remain open.

## Verified archive boundary

- `_stream_7z_chunks` waits for pipe readability against the shared archive
  deadline, then terminates and reaps the matching extractor before raising
  `ArchiveReadError`.
- `_hash_archive_entries` treats that error as incomplete archive evidence;
  partial members are not a complete archive inventory.
- The worker retains each per-platform `ArchiveReadError`, scans the remaining
  selected platforms, then reports the operation as failed. This was verified
  in an isolated temporary scan containing Windows, Wii, and Xbox, where a
  deliberately simulated Wii 7z timeout did not prevent Windows or Xbox from
  being scanned in that operation.
- A normal isolated run for Windows, Wii, and Xbox completed after restoring
  the extractor. The timeout was simulated only in temporary fixture data; no
  NAS content or configuration was read or changed.
- The authenticated local browser view showed the scan page, quick-scan action,
  and live-progress card. Temporary browser and harness resources were cleaned
  up after inspection.

## Checks completed

- Python syntax compilation for touched backend modules: passed.
- Frontend typecheck: passed.
- `git diff --check`: passed.
- No test, test suite, or persistent runtime resource was created or run.

## Remaining blockers and scope

- Direct owned publication previously opened the proof scope without its known
  byte size, so the full-byte verifier always had only the fixed two-second
  allowance. It now opens the existing byte-aware scope with that size and one
  record. This is independent of a stalled 7z extractor, which runs before
  owned publication and has no shared child, descriptor, or deadline.
- A mapped-platform archive failure is retained while selected legacy platforms
  continue; both groups are aggregated into the terminal archive failure only
  after their scans have been attempted.
- Full post-fix isolated timeout UAT remains required before phase completion.
- The regular frontend production build is currently blocked by its PWA Workbox
  configuration, which reports that neither precaching files nor runtime
  caching are configured. This is recorded as a build blocker, not treated as
  a passing build.

The GSD phase must resume from Task 2 before it can be completed and submitted
for full live UAT.
