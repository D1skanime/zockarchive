---
quick_task: 261110-cyq
status: complete
related_phase: 42-hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
verification: passed
---

# Summary

Replaced the incomplete RelatedGamesGrid Storybook ROM fixture with a complete `DetailedRom` contract object, removing the unsafe cast that blocked Phase 42 type verification.

## Verification

- Passed: `cd frontend && npm run typecheck`
