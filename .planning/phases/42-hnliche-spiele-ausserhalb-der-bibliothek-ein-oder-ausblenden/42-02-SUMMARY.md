---
phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
plan: 02
subsystem: ui
tags: [vue, igdb, resolver, authorization, cache]
requires: []
provides:
  - "Account-scoped Similar-game ownership resolver"
  - "Ordered, filter-before-limit Similar-game output"
affects: [game-details, related-games, storybook]
tech-stack:
  added: []
  patterns: ["generation-captured async resolution", "account-scoped successful lookup cache"]
key-files:
  created:
    - frontend/src/v2/composables/useSimilarGameLibraryResolution.ts
  modified: []
key-decisions:
  - "Only HTTP 404 is cached as confirmed absence; all other lookup failures remain retryable errors."
  - "Lookup results are accepted only for the captured game, account, preference, and readiness generation."
patterns-established:
  - "Similar-game rendering consumes centralized resolved entries instead of performing per-card ownership lookups."
requirements-completed: [ZA-RELATED-42-02, ZA-RELATED-42-03, ZA-RELATED-42-04]
duration: 15min
completed: 2026-11-10
---

# Phase 42 Plan 02: Similar-game library resolution Summary

**Typed, account-safe IGDB ownership resolution that filters confirmed local recommendations before the six-card limit.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-11-10T08:43:00Z
- **Completed:** 2026-11-10T08:58:47Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments

- Added discriminated pending, local, absent, and error entry states for provider-ordered Similar games.
- Reused the authorized metadata-provider endpoint with account-scoped success caching and in-flight ID deduplication.
- Prevented stale game, account, preference, and readiness responses from publishing, then derived disabled local-only output before limiting it to six cards.

## Task Commits

1. **Task 1: Define the typed resolver and generation boundary** - `1cb64571b` (feat)
2. **Task 2: Resolve deduplicated ownership and derive visible cards** - `1cb64571b` (feat)

## Files Created/Modified

- `frontend/src/v2/composables/useSimilarGameLibraryResolution.ts` - Resolves authorized local ROM targets and exposes full and visible ordered entries.

## Decisions Made

- A protected lookup returns HTTP 404 for the established no-match outcome, so only that response is cached as `absent`; authorization, network, and server failures remain `error` and retry on the next generation.
- Cache and in-flight maps reset on account changes and disposal. Older requests cannot write their result into a different account cache.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The initial union helper type widened the resolver result during TypeScript checking. It was replaced with an explicit lookup union before the feature commit.

## Verification

- `cd frontend && npm run typecheck` passed after the committed formatter output.
- No tests or test suites were created or run, per the pre-UAT constraint.

## Next Phase Readiness

- Plan 42-03 can pass complete provider input and authoritative UI settings into `useSimilarGameLibraryResolution`, then render `visibleGames` through the controlled Similar-card path.

## Self-Check: PASSED

- Resolver file exists and commit `1cb64571b` is present in Git history.

---
*Phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden*
*Completed: 2026-11-10*
