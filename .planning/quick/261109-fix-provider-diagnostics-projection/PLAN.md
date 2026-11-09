---
quick_id: 261109-fix-provider-diagnostics-projection
status: in_progress
phase: 41
---

# Quick Task: Preserve provider diagnostics in scan projections

## Scope

Correct the durable scan-operation projection after the `game_results_complete`
marker is set. Canonical game rows remain the source for ordinary completed,
indexed, and skipped results, while warning and failed provider rows remain
visible to the explorer, totals, action-required summary, and platform filter.

## Steps

1. Centralize the completed-attempt visibility condition in the projection so
   rows with warning or failed outcomes are retained alongside canonical rows.
2. Apply that condition consistently to paged rows, totals, and platform
   discovery without weakening the attempt boundary or inventory semantics.
3. Inspect the corrected warning/error path in the local browser, record the
   actual result, update quick-task state, and commit the focused change.

## Verification

- No new tests and no test suites before renewed live UAT.
- Use the existing local browser flow to confirm that an actionable provider
  diagnostic remains reachable in the explorer.
- Inspect the diff and run the lightweight relevant static check only if it
  does not constitute a test suite.
