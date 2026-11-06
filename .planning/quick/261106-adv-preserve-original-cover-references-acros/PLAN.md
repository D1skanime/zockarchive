---
quick_id: 261106-adv
title: Preserve cover sources and add active media managers
status: in_progress
parent_phase: 40
---

# Plan

## Wave 1: persistent cover contract and animated source preservation

**depends_on:** []

1. Add a reversible, data-preserving migration and model/schema contract for a
   main-game original cover reference. Capture reliable legacy values before a
   new owned candidate becomes active and restore that reference when the last
   active candidate is removed or the user selects the original cover.
2. Preserve animated GIF and WebP upload bytes through the owned-cover storage
   path while retaining existing validation and limits. Extend the catalog
   contract and UI accept list without converting animated inputs to a still.
3. Keep component ownership separate and retain its existing candidate model.

## Wave 2: cover catalog behavior and placement management views

**depends_on:** [wave_1]

1. Make the persistent original source a normal catalog candidate with explicit
   selection, gallery participation, bounded layout, and safe deletion rules.
2. Extract a feature-level active-placement manager shared by main and
   component media. It lists both image sources for one surface, supports
   gallery preview, placement-only removal, reordering, source labels, and
   empty/loading/error states.
3. Add the two media subtabs and direct action links. Ensure overview order is
   consumed by the real overview display and background/overview remain
   independent.

## Wave 3: documentation and focused validation

**depends_on:** [wave_2]

1. Update backend/frontend architecture documentation, Storybook states, GSD
   STATE, and phase verification with the actual contract and migration limit.
2. Run only targeted static/type/build and browser checks allowed before UAT.
   Do not run the full project regression suite or mutate real library media.
