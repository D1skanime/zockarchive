---
phase: 42
plan: 07
subsystem: frontend-localization
tags: [i18n, settings, related-games]
requires: []
provides:
  - Batch B translations for the related-games visibility preference
  - Batch B localized related-games headings
affects:
  - frontend/src/locales
key_files:
  modified:
    - frontend/src/locales/pt_BR/settings.json
    - frontend/src/locales/ro_RO/settings.json
    - frontend/src/locales/ru_RU/settings.json
    - frontend/src/locales/tr_TR/settings.json
    - frontend/src/locales/zh_CN/settings.json
    - frontend/src/locales/zh_TW/settings.json
    - frontend/src/locales/bg_BG/rom.json
    - frontend/src/locales/cs_CZ/rom.json
    - frontend/src/locales/de_DE/rom.json
    - frontend/src/locales/en_GB/rom.json
    - frontend/src/locales/en_US/rom.json
    - frontend/src/locales/es_ES/rom.json
decisions:
  - Kept the catalogue keys alphabetically adjacent to existing show and single-player entries.
metrics:
  tasks_completed: 2
  tests_run: 0
completed: 2026-11-10
---

# Phase 42 Plan 07: Locale Batch B Summary

Added native translations for the per-account related-games preference and six localized related-games headings.

## Completed Tasks

1. Added the label and help text to the Portuguese, Romanian, Russian, Turkish, Simplified Chinese, and Traditional Chinese settings catalogues.
2. Added the related-games heading to the Bulgarian, Czech, German, British English, US English, and Spanish ROM catalogues.

## Verification

- Parsed all twelve modified locale files with the plan-prescribed Node JSON integrity command.
- Ran `git diff --check` successfully.
- No test suite was run, in accordance with the pre-UAT instruction.

## Deviations from Plan

None. The plan was executed exactly as written.

## Known Limitations

This plan intentionally covers only Batch B. The remaining locale parity work belongs to the other Phase 42 locale plans.

## Self-Check: PASSED

All twelve requested locale files and this summary exist in the planned paths.
