---
status: complete
quick_id: 261109-fix-provider-diagnostics-projection
phase: 41
---

# Quick Task Summary: Preserve provider diagnostics in scan projections

The review finding was confirmed. Once `game_results_complete` was set, all
completed-attempt projections retained only the canonical empty-provider game
rows. Durable provider warning and failure rows were therefore absent from the
explorer, totals, action-required summary, and platform list.

`scan_operation_projection` now shares one completion visibility condition:
canonical rows remain visible and provider rows with `warning` or `failed`
outcomes remain visible. The attempt boundary, mapping joins, and explicit
Windows inventory classification are unchanged.

The focused Trunk check passed for the changed backend module. Browser
inspection on the local test instance started a normal quick scan and operated
the action-required result filter and reset at desktop and mobile widths without
scan-API errors. The available test scan had no provider diagnostic to render,
so it could only confirm the empty action-required state; the external GitHub
release check returned 404 and the unauthenticated bootstrap request returned
401 before login, both outside the scan flow.

No tests or test suites were added or run because renewed human live UAT is
still required after this product correction. No architecture document required
an update because this is an internal projection inclusion rule; its invariant
is documented at the shared predicate.
