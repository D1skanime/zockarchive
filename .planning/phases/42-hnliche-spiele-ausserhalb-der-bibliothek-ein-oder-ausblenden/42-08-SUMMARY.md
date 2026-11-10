---
phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
plan: 08
subsystem: frontend-localization
tags: [i18n, related-games, locale-catalogue]
requires:
  - phase: 42-04
    provides: "Batch A settings translations"
  - phase: 42-07
    provides: "Batch B settings and ROM translations"
provides:
  - "Localized Similar games headings in the final twelve ROM catalogues"
  - "A parity and sorted-key receipt for the complete locale catalogue"
affects:
  - frontend/src/locales
  - frontend/src/v2/components/GameDetails/OverviewTab.vue
tech-stack:
  added: []
  patterns:
    - "ROM section headings use sorted locale-native i18n keys."
key-files:
  created:
    - .planning/phases/42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden/42-08-SUMMARY.md
  modified:
    - frontend/src/locales/fr_FR/rom.json
    - frontend/src/locales/hu_HU/rom.json
    - frontend/src/locales/it_IT/rom.json
    - frontend/src/locales/ja_JP/rom.json
    - frontend/src/locales/ko_KR/rom.json
    - frontend/src/locales/pl_PL/rom.json
    - frontend/src/locales/pt_BR/rom.json
    - frontend/src/locales/ro_RO/rom.json
    - frontend/src/locales/ru_RU/rom.json
    - frontend/src/locales/tr_TR/rom.json
    - frontend/src/locales/zh_CN/rom.json
    - frontend/src/locales/zh_TW/rom.json
key-decisions:
  - "Added only the locale-native rom.similar-games headings assigned to this final batch."
  - "Used the repository parity and key-order validators after the prior locale batches had completed."
patterns-established:
  - "Add UI-visible ROM headings to every locale catalogue and preserve alphabetical key order."
requirements-completed: [ZA-RELATED-42-05]
metrics:
  tasks_completed: 2
  files_modified: 12
  tests_run: 0
completed: 2026-11-10
---

# Phase 42 Plan 08: Final Related-Games Locale Catalogue Summary

**Twelve locale-native `rom.similar-games` headings complete the related-games catalogue, with full locale parity and sorted-key validation passing.**

## Accomplishments

1. Added sorted Similar games section headings to the French, Hungarian, Italian, Japanese, Korean, Polish, Portuguese, Romanian, Russian, Turkish, Simplified Chinese, and Traditional Chinese ROM catalogues.
2. Parsed all twelve changed JSON files successfully.
3. Confirmed the complete locale catalogue has translation-key parity and alphabetical key order.

## Task Commits

1. **Task 1: Translate Batch C ROM headings** - `cb8cef1b5` (feat)
2. **Task 2: Validate final locale parity and sorted order** - no code commit, validation-only task completed before the task commit.

## Verification

- `node -e 'for (const file of process.argv.slice(1)) JSON.parse(require("node:fs").readFileSync(file, "utf8"))' src/locales/{fr_FR,hu_HU,it_IT,ja_JP,ko_KR,pl_PL,pt_BR,ro_RO,ru_RU,tr_TR,zh_CN,zh_TW}/rom.json`
- `python3 src/locales/check_i18n_locales.py`
- `python3 src/locales/check_i18n_sorted.py`
- `git diff --check`

All commands passed. No test suite was added or run, in accordance with the pre-UAT phase rule.

## Decisions Made

- Kept the new key between `show-earned-only` and `single-player` in every affected JSON catalogue.
- The no-match and resolver-error UI states intentionally receive no locale strings because the complete Similar games section is omitted in those states.

## Deviations from Plan

None. The plan was executed exactly as written.

## Known Limitations

This plan validates catalogue integrity only. Typecheck, build, Storybook rendering, and browser UAT belong to their separately assigned Phase 42 plans.

## Self-Check: PASSED

All twelve requested locale files exist with the assigned translations, and task commit `cb8cef1b5` is present in repository history.
