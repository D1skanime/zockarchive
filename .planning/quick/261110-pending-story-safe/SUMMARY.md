---
quick_id: 261110-pending-story-safe
status: complete
phase: 42
review_finding: WR-01
verification: passed_with_host_warnings
---

# Quick Task Summary: Keep disabled pending stories local-only

Resolved WR-01 in the real `OverviewTab` Storybook composition. The disabled
pending and lookup-error examples now pass the same confirmed-local projection
as the product's disabled result, so their unresolved or failed external
recommendations cannot mount a card. The already resolved local card remains
visible in both examples.

## Verification

- Passed: `cd frontend && CACHE_DIR="$TMPDIR/storybook-42-wr01" npm run storybook -- --smoke-test`
- Confirmed in the focused diff: both disabled fixtures call
  `visibleLocalEntries` before `renderOverview`.

Storybook reported its pre-existing read-only global-settings and runtime
registry warnings, plus existing docgen warnings. The smoke renderer exited
successfully. No tests or test suites were added or run.
