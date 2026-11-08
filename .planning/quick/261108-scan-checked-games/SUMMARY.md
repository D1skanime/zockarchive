---
quick_id: 261108-scan-checked-games
status: complete
phase: 41
---

# Persist checked games in scan results

New scan attempts now record one canonical provider-independent item for every
completed or skipped game. The explorer projects those rows for new attempts,
so console platforms and unchanged games appear once each and metadata providers
cannot multiply result counts. Existing Windows inventory accounting remains
separate from the result rows.

Scoped Trunk passed. No tests or test suites were run before live UAT.
