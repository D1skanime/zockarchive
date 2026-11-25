---
phase: 48-za-technische-beschreibungshinweise-entfernen-und-gemeinsame
plan: 01
subsystem: ui
tags: [vue, v2, descriptions, metadata]
requires:
  - phase: 47
    provides: Existing v2 game-detail and explicit metadata-editor surfaces
provides:
  - Normal game and PC DLC description views without automatic technical provenance
  - Documented boundary between source-neutral display and explicit metadata editing
affects: [48-03, game-details, localized-descriptions]
tech-stack:
  added: []
  patterns:
    - Normal description surfaces consume only selected text, locale, and empty state
key-files:
  created: []
  modified:
    - frontend/src/v2/components/GameDetails/OverviewTab.vue
    - frontend/src/v2/components/GameDetails/PcDlcDetail.vue
    - docs/FRONTEND_ARCHITECTURE.md
key-decisions:
  - Keep description fallback resolution and editor provenance unchanged.
  - Remove presentation call sites instead of translating or special-casing notice text.
patterns-established:
  - Technical provenance is available only in the explicitly opened localized description editor.
requirements-completed: [UI-48-01, UI-48-02]
duration: 12min
completed: 2026-11-25
---

# Phase 48 Plan 01: Normal description presentation summary

**Normal game and PC DLC descriptions now render selected localized text or the established empty state without provider or fallback provenance, while the explicit editor retains its metadata context.**

## Accomplishments

- Removed the shared provenance-presentation construction and paragraph from `OverviewTab.vue`.
- Removed the equivalent PC DLC provenance construction, paragraph, and unused style rule from `PcDlcDetail.vue`.
- Documented the display/editor boundary in the frontend architecture guide.

## Task Commits

1. **Task 1: Remove normal-view provenance construction and rendering** - `82b1f5a70` (`fix`)
2. **Task 2: Document the normal-presentation boundary** - `3fc8c3ce4` (`docs`)

## Verification

- `git diff --check` passed for the three plan files.
- The repository commit hook checked each committed changed-file set with no issues.
- No tests, typecheck, lint suite, production build, browser harness, or browser inspection ran. Plan 48-03 owns the pre-UAT typecheck, lint, and production-build handoff.
- Targeted source inspection confirms `descriptionPresentation()` remains used by `LocalizedDescriptionEditor.vue` and is absent from both normal detail surfaces.

## Decisions Made

- The existing description resolver remains the sole owner of selected text and locale, so German text, English fallback text, and the ordinary empty state retain their behavior.
- The explicitly opened editor remains the only user-facing surface that presents provider or fallback provenance.

## Deviations from Plan

None - plan implementation followed the specified presentation boundary.

## Known Stubs

None.

## Next Phase Readiness

Plan 48-03 can consume the backend capability and run the phase's shared pre-UAT typecheck, lint, and production build. Human UAT still needs desktop and mobile checks for German, English-fallback, and empty descriptions, plus confirmation that the explicit editor still shows provenance.

## Self-Check: PASSED

- All three declared implementation/documentation files exist and the task commits are present in Git history.
