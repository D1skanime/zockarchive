---
quick_id: 261110-pending-story-safe
status: in_progress
phase: 42
review_finding: WR-01
---

# Quick Task: Keep disabled pending stories local-only

## Scope

Correct the Phase 42 Storybook fixture for the reviewed disabled loading state.
The real `OverviewTab` composition must receive only confirmed local entries,
so an unresolved external recommendation cannot render while the preference is
off. Apply the same projection to the disabled lookup-error example.

## Steps

1. Reuse the story's `visibleLocalEntries` projection for the pending and
   lookup-error disabled fixtures.
2. Run the permitted Storybook smoke rendering check, inspect the focused diff,
   and record the outcome without running a test suite.

## Verification

- `cd frontend && CACHE_DIR="$TMPDIR/storybook-42-wr01" npm run storybook -- --smoke-test`
- Confirm both fixtures pass only local resolved entries to `OverviewTab`.
