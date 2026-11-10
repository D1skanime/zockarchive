---
quick_task: 261110-k8m
status: planned
---

# Repair regression-gate test fixtures

## Findings

- The new resolver test fixture omits required `cover_url` data.
- The product-identity locale ledger predates the accepted Phase 42 `rom.json`
  translations, so all eighteen truthful locale contracts fail.

## Plan

1. Complete the generated IGDB fixture without changing production behaviour.
2. Regenerate only the `rom` digest contracts from the accepted locale files.
3. Run the reported typecheck and affected locale/resolver unit tests.
