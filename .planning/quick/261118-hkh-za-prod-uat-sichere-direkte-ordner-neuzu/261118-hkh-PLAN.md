---
quick_id: 261118-hkh
title: Safe direct-folder reassignment and scan-error filtering
status: ready
tasks:
  - id: mapping-recovery
    files:
      - frontend/src/v2/components/Settings/DirectGamesFolderMappingsSection.vue
      - frontend/src/locales/*/settings.json
    action: Guide a conflicting direct platform reassignment through the existing explicit exclusion transition, preserving catalog data and keeping the server-side conflict protection intact.
    verify: Exercise the completed-setup Games tab with an existing and a pending folder in the authenticated browser.
    done: A changed persisted mapping explains its impact, offers the supported exclusion save, and permits the administrator to make the new platform choice only after reload.
  - id: filtered-operation-failure
    files:
      - frontend/src/v2/components/Scan/ScanOperationResults.vue
      - frontend/src/locales/*/scan.json
    action: Keep a terminal operation or platform failure visible when result filters have no matching game rows, without pretending it is tied to a game.
    verify: Inspect the results explorer with a failed outcome filter and an empty filtered page in the authenticated browser.
    done: The empty state distinguishes a no-match filter from an operation-level failure and exposes its safe cause and next action.
  - id: docs-and-uat
    files:
      - docs/FRONTEND_ARCHITECTURE.md
      - .planning/quick/261118-hkh-za-prod-uat-sichere-direkte-ordner-neuzu/261118-hkh-SUMMARY.md
      - .planning/STATE.md
    action: Document the two safe UI contracts and record the desktop/mobile browser evidence.
    verify: Run no automated tests before UAT; inspect every changed interaction on desktop and mobile with browser console and failed-request capture.
    done: Architecture, GSD summary/state, screenshots, and the UAT report agree with the shipped behavior.
---

# Quick Task 261118-hkh: Safe direct-folder reassignment and scan-error filtering

## Goal

Prevent a confusing retry after `setup_assignment_conflict` by guiding the
administrator through the already supported explicit exclusion transition. Keep
operation-level failures visible in the result explorer when a game filter has
no matching row, while retaining game-specific failures as filterable rows.

## Constraints

- Do not weaken the backend overlap and mapping-conflict checks.
- Do not delete, move, or rewrite existing catalog data from the UI.
- Use existing scan operation status fields and result queries, not a parallel
  status mechanism.
- No new tests and no test suites before live UAT.
- Validate changed UI flows in the authenticated browser at 1440 px and 390 px.
