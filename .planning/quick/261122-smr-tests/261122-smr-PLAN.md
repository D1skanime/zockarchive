---
quick_id: 261122-smr-tests
title: Test terminal scan-media recovery priority
status: complete
---

# Test terminal scan-media recovery priority

## Scope
Add direct coverage for the accepted recovery behavior without changing
production code.

## Steps
1. Model a confirmed terminal receipt and a bounded recovery budget.
2. Assert it is reconciled before cursor traversal begins.
3. Run only the affected recovery test module and record the result.

## Acceptance criteria
- Terminal receipts consume the recovery budget before advisory cursor work.
- The test directly exercises the recovery handler boundary.
- Only tests and GSD documentation change.
