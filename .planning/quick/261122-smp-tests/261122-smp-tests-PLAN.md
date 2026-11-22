---
quick_id: 261122-smp-tests
title: Add scan-media recovery cursor regression tests
status: complete
---

# Scan-media recovery test coverage

## Scope

Add direct unit coverage for the approved resumed-cursor recovery behavior and
repair the terminal-attempt priority path exposed by that coverage.

## Steps

1. Assert that a resumed cursor ending before a terminal receipt restarts once
   and reconciles that receipt within the same invocation.
2. Assert that a fresh completed cursor does not make an unnecessary restart.
3. Prioritize bounded, database-confirmed terminal attempts before the generic
   cursor without bypassing manifest, content-proof, ownership, or fence checks.
4. Run only the recovery cursor and crash-publication test files, update state,
   and commit.
