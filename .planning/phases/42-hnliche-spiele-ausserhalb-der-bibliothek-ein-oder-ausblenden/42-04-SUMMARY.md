---
phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
plan: 04
subsystem: frontend-i18n
tags: [i18n, settings, related-games]
requires: []
provides:
  - "Batch A translations for the related-games visibility preference"
affects:
  - "Settings/User interface"
key_files:
  modified:
    - frontend/src/locales/bg_BG/settings.json
    - frontend/src/locales/cs_CZ/settings.json
    - frontend/src/locales/de_DE/settings.json
    - frontend/src/locales/en_GB/settings.json
    - frontend/src/locales/en_US/settings.json
    - frontend/src/locales/es_ES/settings.json
    - frontend/src/locales/fr_FR/settings.json
    - frontend/src/locales/hu_HU/settings.json
    - frontend/src/locales/it_IT/settings.json
    - frontend/src/locales/ja_JP/settings.json
    - frontend/src/locales/ko_KR/settings.json
    - frontend/src/locales/pl_PL/settings.json
decisions:
  - "Keep this batch limited to the twelve assigned settings catalogues; ROM headings belong to the dedicated locale plans."
---

# Phase 42 Plan 04: Batch A Settings Translations Summary

Added locale-native labels and descriptions for the per-user related-games visibility preference in the first twelve settings catalogues.

## Completed Tasks

1. Added `show-similar-games-outside-library` and `show-similar-games-outside-library-desc` to the Batch A settings catalogues in sorted positions.
2. Validated each changed catalogue as JSON and confirmed the two keys and alphabetical placement.

## Verification

- `git diff --check -- src/locales/{bg_BG,cs_CZ,de_DE,en_GB,en_US,es_ES,fr_FR,hu_HU,it_IT,ja_JP,ko_KR,pl_PL}/settings.json`
- `node -e 'for (const file of process.argv.slice(1)) JSON.parse(require("node:fs").readFileSync(file, "utf8"))' src/locales/{bg_BG,cs_CZ,de_DE,en_GB,en_US,es_ES,fr_FR,hu_HU,it_IT,ja_JP,ko_KR,pl_PL}/settings.json`

Both checks passed. No test suite was run, per the pre-UAT phase rule.

## Deviations from Plan

None. ROM heading catalogues were intentionally not changed because their ownership is assigned to plans 42-07 and 42-08.

## Known Limitations

This independent batch does not perform cross-locale parity validation. That validation belongs to the final locale batch after all assigned catalogues are complete.

## Self-Check: PASSED

The summary exists and commit `ba3845db3` is present in the repository history.
