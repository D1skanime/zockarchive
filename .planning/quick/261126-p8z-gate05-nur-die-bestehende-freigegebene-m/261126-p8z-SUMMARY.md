---
quick_id: 261126-p8z
title: Gate05 locale digest correction after accepted Phase 51 UAT
status: complete
subsystem: frontend locale test baseline
tags: [vitest, vue-i18n, locale-contract, gate05]
key_files:
  modified:
    - frontend/src/v2/config/project-locales.test.ts
    - frontend/src/v2/config/__tests__/media-locales.baseline.json
completed: 2026-11-26
---

# Gate05 locale digest correction after accepted Phase 51 UAT

## Result

Corrected only the approved `rom` digest references that became stale after the
accepted provider-media publication failure message. The existing locale
contract now also verifies that every supported `rom.json` contains a non-empty
`match-media-publication-failed` string, retains `{detail}`, and interpolates a
diagnostic detail through Vue I18n.

## Semantic-diff proof

`git diff main...HEAD -- frontend/src/locales/*/rom.json` names exactly the 18
supported locale files. Object comparison against `main` confirmed one and only
one addition in each: `match-media-publication-failed`. There were no removals
or replacements, and every new string contains `{detail}`. The changed locale
set exactly matches the 18 `media-locales.baseline.json` locale entries.

Only those 18 `rom` SHA-256 values were recalculated with the test's existing
product-name normalization and digest algorithm. No other baseline namespace or
key was changed. Product locale files and production code remain untouched.

## Verification

- `cd frontend && npm run test -- src/v2/config/project-locales.test.ts`
  passed: 1 file, 21 tests.
- Recomputed all 18 approved `rom` digests after the update: zero mismatches.
- `git diff --check` passed before commit.

The frontend full suite was deliberately not run because the runner owns that
gate. No backend test run is claimed or implied. No browser, snapshot, click,
mouse, product-code, locale-file, merge, push, or release action was performed.

## Deviations from Plan

None.

## Known Stubs

None.

## Self-Check: PASSED

- Both approved test files exist and are the only product-adjacent changed
  files.
- The Quick plan and this summary are present in the designated Quick directory.
