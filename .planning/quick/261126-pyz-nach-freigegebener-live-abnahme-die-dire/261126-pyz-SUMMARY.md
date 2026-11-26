---
quick_id: 261126-pyz
title: Direct same-ID rematch regression tests after accepted live UAT
status: complete
subsystem: frontend match payload logic test
tags: [vitest, regression, direct-logic, match-rom]
key_files:
  modified:
    - frontend/src/v2/components/Dialogs/MatchRomDialog.test.ts
completed: 2026-11-26
---

# Direct same-ID rematch regression tests after accepted live UAT

## Result

Extended the existing direct classic-payload decision matrix with independent
`name_sort_key` and `summary` changes. Each field now proves that a same-ID
payload is not treated as an unchanged media-refresh-only confirmation.

The existing exact-payload success assertion and every prior changed-field
assertion remain unchanged. No product code, rendering, browser interaction,
snapshot, fixture, or other test file changed.

## Verification

- `cd frontend && npm run test -- src/v2/components/Dialogs/MatchRomDialog.test.ts`
  passed: 1 file, 22 tests.
- `git diff --check` passed before commit.

No full suite was run because ki-run owns the complete regression execution.

## Deviations from Plan

None.

## Known Stubs

None.

## Self-Check: PASSED

- The named direct-test file contains both added payload-field contracts.
- This summary and the Quick plan are present in the designated Quick directory.
