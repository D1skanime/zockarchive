---
phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
reviewed: 2026-11-10T00:00:00Z
depth: deep
files_reviewed: 48
files_reviewed_list:
  - docs/FRONTEND_ARCHITECTURE.md
  - frontend/scripts/storybook-language-decisions.json
  - frontend/src/composables/useUISettings.ts
  - frontend/src/v2/views/Settings/UserInterface.vue
  - frontend/src/v2/composables/useSimilarGameLibraryResolution.ts
  - frontend/src/v2/views/GameDetails.vue
  - frontend/src/v2/components/GameDetails/OverviewTab.vue
  - frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue
  - frontend/src/v2/components/GameDetails/RelatedGameCard.vue
  - frontend/src/v2/components/GameDetails/RelatedGamesGrid.stories.ts
  - frontend/src/v2/components/Settings/SettingsToggleRow.stories.ts
  - frontend/src/v2/storybook/compositionInventory.ts
  - frontend/src/locales/bg_BG/rom.json
  - frontend/src/locales/bg_BG/settings.json
  - frontend/src/locales/cs_CZ/rom.json
  - frontend/src/locales/cs_CZ/settings.json
  - frontend/src/locales/de_DE/rom.json
  - frontend/src/locales/de_DE/settings.json
  - frontend/src/locales/en_GB/rom.json
  - frontend/src/locales/en_GB/settings.json
  - frontend/src/locales/en_US/rom.json
  - frontend/src/locales/en_US/settings.json
  - frontend/src/locales/es_ES/rom.json
  - frontend/src/locales/es_ES/settings.json
  - frontend/src/locales/fr_FR/rom.json
  - frontend/src/locales/fr_FR/settings.json
  - frontend/src/locales/hu_HU/rom.json
  - frontend/src/locales/hu_HU/settings.json
  - frontend/src/locales/it_IT/rom.json
  - frontend/src/locales/it_IT/settings.json
  - frontend/src/locales/ja_JP/rom.json
  - frontend/src/locales/ja_JP/settings.json
  - frontend/src/locales/ko_KR/rom.json
  - frontend/src/locales/ko_KR/settings.json
  - frontend/src/locales/pl_PL/rom.json
  - frontend/src/locales/pl_PL/settings.json
  - frontend/src/locales/pt_BR/rom.json
  - frontend/src/locales/pt_BR/settings.json
  - frontend/src/locales/ro_RO/rom.json
  - frontend/src/locales/ro_RO/settings.json
  - frontend/src/locales/ru_RU/rom.json
  - frontend/src/locales/ru_RU/settings.json
  - frontend/src/locales/tr_TR/rom.json
  - frontend/src/locales/tr_TR/settings.json
  - frontend/src/locales/zh_CN/rom.json
  - frontend/src/locales/zh_CN/settings.json
  - frontend/src/locales/zh_TW/rom.json
  - frontend/src/locales/zh_TW/settings.json
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 42: Code Review Report

**Reviewed:** 2026-11-10T00:00:00Z
**Depth:** deep
**Files Reviewed:** 48
**Status:** issues_found

## Summary

Reviewed all Phase-42 source, locale, documentation, and current uncommitted Phase-42 settings changes since `4e59c9e9f`. The resolver correctly scopes successful lookup cache entries to the active account, does not cache non-404 failures as absence, invalidates obsolete generations, deduplicates IGDB lookup requests, and filters before the six-card limit. The production path passes only `visibleGames` into the controlled grid, so it does not expose an external card when the preference is disabled.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Disabled loading Storybook state still renders an external card

**File:** `frontend/src/v2/components/GameDetails/RelatedGamesGrid.stories.ts:245-251`

**Issue:** The story named `Aus: Auflösung läuft` passes a `pending` entry straight to `OverviewTab`. `RelatedGamesGrid` renders every supplied `resolvedSimilarGames` entry (`RelatedGamesGrid.vue:31-37`), so this story visibly renders the unresolved, externally linked card. That contradicts the required disabled-state behavior: while resolution is pending, only confirmed local games may appear. It makes the required Storybook/UAT evidence misleading even though the live `visibleGames` computed value filters correctly.

**Fix:** Build this fixture from the same disabled visibility projection as production, for example pass only the local entries (`entries.filter((entry) => entry.status === "local").slice(0, 6)`) to `renderOverview`. Apply the same rule to the lookup-error story when it is intended to demonstrate the disabled state, or render the resolver-facing composition with an explicit disabled preference so the real projection is exercised.

---

_Reviewed: 2026-11-10T00:00:00Z_
_Reviewer: the agent (independent adversarial review)_
_Depth: deep_
