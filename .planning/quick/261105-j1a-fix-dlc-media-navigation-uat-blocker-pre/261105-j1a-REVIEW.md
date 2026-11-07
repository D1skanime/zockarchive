---
phase: 40-unify-pc-media-surfaces-and-complete-storybook-coverage
reviewed: 2026-11-05T15:10:00Z
depth: deep
files_reviewed: 9
files_reviewed_list:
  - docs/FRONTEND_ARCHITECTURE.md
  - frontend/e2e/fixtures/screenshot-management.ts
  - frontend/e2e/screenshot-management.spec.ts
  - frontend/src/v2/components/GameDetails/MediaManagement.stories.ts
  - frontend/src/v2/components/GameDetails/PcDlcDetail.vue
  - frontend/src/v2/components/GameDetails/PcDlcMediaTab.behavior.test.ts
  - frontend/src/v2/components/GameDetails/PcDlcMediaTab.vue
  - frontend/src/v2/components/GameDetails/pcDlcMediaPresentation.ts
  - frontend/src/v2/components/GameDetails/pcDlcPrimaryTabSync.ts
findings:
  critical: 1
  warning: 2
  info: 0
  total: 3
status: issues_found
---

# Quick Task 261105-j1a: Code Review Report

**Reviewed:** 2026-11-05
**Depth:** deep
**Files Reviewed:** 9
**Status:** issues_found

## Summary

The primary-tab click path is improved and the locked DLC media surface is
preserved. However, the new synchronizer is bypassed by two productive menu
actions. In particular, the Artwork menu action can still be reverted to the
old URL tab as soon as the media subtab writes its query, recreating a visible
navigation failure through a real UI entry point. The browser regression also
does not assert the post-Media hit target and focus conditions claimed by the
quick verification.

## Critical Issues

### CR-01: Overflow-menu primary navigation bypasses the new query synchronizer

**File:** `frontend/src/v2/components/GameDetails/PcDlcDetail.vue:166-168,235-244`

**Issue:** `showMedia()` and the Download menu item mutate `tab` directly.
The prior `watch(tab, ...)` was removed and URL persistence now exists only in
`selectTab()`. From, for example, `?tab=overview`, clicking the productive
Artwork menu item renders the Media component while the URL still says
`overview`. Its immediate media-subtab watcher then replaces the query with
`tab=overview&subtab=screenshots`; `usePcDlcPrimaryTabSync` has no pending tab
and updates the view back to Overview. Thus the menu can flash Media and
return to the old tab, and the Download menu link similarly produces a
non-bookmarkable, stale URL. This is a user-visible navigation regression in
the exact area being remediated.

**Fix:** Route every programmatic primary-tab entry through the same boundary,
for example replace `showMedia()` with `selectTab("media")` and bind Download
to `@click="selectTab('pc-components')"`. Add a browser assertion that opens
each menu action from a non-matching primary tab and verifies both the visible
panel and `?tab=` after the Media subtab initialization settles.

## Warnings

### WR-01: Router failure can make the synchronizer spin indefinitely

**File:** `frontend/src/v2/components/GameDetails/pcDlcPrimaryTabSync.ts:18-29`

**Issue:** Vue Router resolves a cancelled or rejected navigation as a
navigation-failure value rather than necessarily throwing. If `router.replace`
does not commit (for example a navigation guard aborts it), `pendingTab` and
`route.query.tab` never change, so the `while` loop immediately calls
`router.replace` again forever. The `finally` retry repeats the same condition
as well. This can starve the UI after a route cancellation instead of keeping
the current tab stable.

**Fix:** Capture the result of `router.replace`, clear or restore the pending
state on a navigation failure, and bound retries to a new route change rather
than looping while the route is unchanged. Add a unit test with a router mock
that resolves a navigation failure and assert it performs one attempt.

### WR-02: Regression evidence overstates hit-testing and focus coverage

**File:** `frontend/e2e/screenshot-management.spec.ts:1002-1018,1024-1046`; `.planning/quick/261105-j1a-fix-dlc-media-navigation-uat-blocker-pre/261105-j1a-VERIFICATION.md:11-13`

**Issue:** The test performs `elementFromPoint` and `pointer-events` checks
only for the Media tab before the transition. It then clicks the other primary
tabs, but never measures their hit targets or pointer-events after Media has
mounted, and it never asserts focus after any click. The verification claims
that focus and hit-test assertions cover the real transition, which is not
supported by the test. This leaves the reported overlay/focus failure mode
under-tested on the controls that the UAT report says are unreachable.

**Fix:** For every primary tab after Media mounts, assert center-point hit
ownership and usable pointer events immediately before clicking, then assert
`document.activeElement` is that tab (or its intended focusable descendant)
after the click. Update the verification text only after those checks exist.

---

_Reviewed: 2026-11-05T15:10:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
