---
phase: 47
status: human_needed
verified_at: 2026-11-22
---

# Phase 47 Verification

## Technical result

The implementation uses one manifest and browser queue flow for existing PC
components and eligible PS3 folder groups. The server owns folder eligibility,
selection and member paths; the client sends only `whole_folder: true` and
does not enumerate thousands of members. Existing ordinary PC component,
PS3 ISO/single-file and Patcher paths remain separate.

## Evidence

- Typecheck, scoped Trunk checks, Python compilation and production build pass.
- The isolated temporary fixture has 3,076 nested PS3 paths with zero internal
  path, size or checksum mismatches.
- No tests were added, changed or run, and no browser, Docker or live library
  work was performed, as required before human UAT.

## Human verification required

1. On desktop and mobile, confirm Game Download has no `Metadaten suchen` or
   `Use local images` controls, while the dedicated metadata and media views
   remain usable.
2. For an eligible PS3 folder, verify standard and enhanced modes enter the
   existing manager with visible bounded progress, cancellation, retry and
   resume; enhanced mode must retain `PS3_GAME/USRDIR` hierarchy.
3. Verify PC download regression, PS3 ISO/single-file Patcher behavior, and
   bounded errors for unavailable inventory, denied storage and a failed member.
