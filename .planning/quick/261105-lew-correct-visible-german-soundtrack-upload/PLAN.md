---
quick_id: 261105-lew
title: Correct visible German soundtrack-upload catalog text
status: ready
created: 2026-11-05
parent_phase: 40
wave: 1
depends_on: []
files_modified:
  - frontend/src/locales/de_DE/rom.json
  - .planning/quick/261105-lew-correct-visible-german-soundtrack-upload/SUMMARY.md
  - .planning/quick/261105-lew-correct-visible-german-soundtrack-upload/VERIFICATION.md
autonomous: true
must_haves:
  truths:
    - "A German-speaking user sees German upload hint, failure, and success copy in the productive main-game soundtrack upload UI."
    - "The correction is visible after authenticating through the normal UAT login form and opening the soundtrack panel."
  artifacts:
    - path: frontend/src/locales/de_DE/rom.json
      provides: "Corrected existing German soundtrack-upload catalogue values"
    - path: .planning/quick/261105-lew-correct-visible-german-soundtrack-upload/VERIFICATION.md
      provides: "Sanitized browser recheck evidence without credentials"
  key_links:
    - from: frontend/src/v2/components/GameDetails/SoundtrackPanel.vue
      to: frontend/src/locales/de_DE/rom.json
      via: "t('rom.soundtrack-*')"
      pattern: "soundtrack-(owned-hint|upload-error|upload-hint|uploaded)"
---

# Correct visible German soundtrack-upload catalog text

## Objective

Replace the remaining English strings that are visibly rendered by the existing
German soundtrack upload surface, then prove the corrected copy in the running,
authenticated application.

Purpose: remove an actual visible localisation defect without widening the
media feature scope or revisiting the completed navigation work.

## Context

@.planning/quick/261105-lew-correct-visible-german-soundtrack-upload/CONTEXT.md
@frontend/src/v2/components/GameDetails/SoundtrackPanel.vue
@frontend/src/locales/de_DE/rom.json

## Plan

### Wave 1: edit only confirmed German catalogue values and visually recheck

1. In `frontend/src/locales/de_DE/rom.json`, translate only the existing keys
   `soundtrack-owned-hint`, `soundtrack-upload-error`,
   `soundtrack-upload-hint`, and `soundtrack-uploaded` when they retain English
   copy. Keep key names, interpolation tokens, punctuation conventions, JSON
   ordering, and the upload component wiring unchanged, per D-01. Do not edit
   Vue, TypeScript, CSS, APIs, documentation outside this quick directory, or
   any non-German locale.
2. Use a temporary Playwright script under `$TMPDIR` that reads the UAT URL and
   test credentials at runtime from the approved environment file, signs in
   through the normal form, opens the main-game soundtrack panel, and confirms
   that the visible upload title/hint and any rendered error or success state
   use the corrected German values. Do not upload, delete, or mutate UAT data.
   Never print or persist credentials, cookies, tokens, or their values. This
   is a browser recheck, not an automated test, per D-02.
3. Record the executed browser route, visible controls checked, result, and any
   browser console/network observation in `SUMMARY.md` and `VERIFICATION.md`.
   Keep the record sanitized. Do not change `STATE.md`, stage files, create a
   commit, switch branches, push, merge, or run test commands, per D-03.

## Acceptance criteria

- The productive German soundtrack upload surface no longer renders English for
  the confirmed upload hint, error, or success catalogue keys.
- The browser proof uses normal authenticated UI navigation and does not mutate
  existing media.
- No application source other than the specified German catalogue file, no
  `STATE.md`, and no Git state is changed by this quick task.
- No tests or test suites are added or run.
