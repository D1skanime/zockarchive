---
quick_id: 261105-gnr
title: Restore detail navigation after entering media
status: in_progress
created: 2026-11-05
parent_phase: 40
wave: 1
depends_on: []
---

# Restore detail navigation after entering media

## Context

Live UAT reports that controls become unclickable after opening Media on both
the PC game detail page and its DLC detail page. The DLC manual scope remains
intentionally absent. The correction must preserve uploads and media actions.

## Inventory and diagnosis

The shared media upload header is sticky and has `z-index: 2`. Both detail
shells place the media panel after their primary tab controls, but the panel
does not create a stacking boundary. A sticky media descendant can therefore
paint into primary-navigation hit areas when the panel scrolls.

## Plan

### Wave 1: contain media stacking and prove navigation regression coverage

1. Give each primary detail navigation a deliberate higher stacking level.
2. Isolate each scroll panel so sticky media controls cannot escape its hit
   region.
3. Add rendered tab-transition coverage for the DLC shell and update the
   browser media helper to target the productive shared tab navigation.
4. Run focused frontend tests, type checking, and the targeted frontend gate.

## Acceptance criteria

- Opening Media cannot cover the primary game or DLC tab navigation.
- The user can select Media and then a different primary tab again.
- Upload controls remain available inside Media.
- No full project regression suite runs before renewed live UAT.
