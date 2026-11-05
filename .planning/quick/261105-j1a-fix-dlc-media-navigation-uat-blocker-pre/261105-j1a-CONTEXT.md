# Quick Task 261105-j1a: Fix DLC media navigation UAT blocker - Context

**Gathered:** 2026-11-05
**Status:** Ready for planning

<domain>
## Task Boundary

Reproduce the real browser path into `/rom/24/dlc/20?tab=media`, diagnose why
subsequent primary tabs, navigation, or controls can become unclickable, and
fix the confirmed runtime cause. Add a targeted regression for that exact
transition, then return the existing job to live UAT without a full suite.

</domain>

<decisions>
## Implementation Decisions

### Evidence standard
- A real navigation and click path is required. Source searches, mounting a
  component, or calling handlers directly are not evidence.
- Diagnose the actual runtime hit target, pointer-event behavior, router query
  synchronization, and focus state before selecting a fix.

### Scoped DLC capabilities
- DLCs and expansions have no dedicated manual, soundtrack, or background
  placement. Their songs and background belong to the main game.
- DLC and expansion images retain only overview and delete management actions.
- The dedicated cover and active poster selection remain available for PC
  games, DLCs, and expansions. Artwork is not renamed into cover.
- Existing stored media and backend contracts remain non-destructively intact.

### the agent's Discretion
- Reuse the productive navigation and media primitives. Choose the smallest
  runtime-correct layering, focus, or routing correction supported by browser
  evidence.
- Keep Storybook and architecture documentation accurate when the corrected
  behavior changes their stated contract.

</decisions>

<specifics>
## Specific Ideas

- Inspect actual element hit-testing and computed pointer/stacking state after
  the transition, including desktop and narrow viewports where feasible.
- Do not operate destructive UAT controls while reproducing the issue.

</specifics>

<canonical_refs>
## Canonical References

- Parent phase: `.planning/phases/40-unify-pc-media-surfaces-and-complete-storybook-coverage/`
- Previous navigation quick task: `.planning/quick/261105-gnr-media-tab-input/`
- Live UAT target: `/rom/24/dlc/20?tab=media`

</canonical_refs>
