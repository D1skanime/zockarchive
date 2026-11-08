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

Scoped Trunk passed. An authorized isolated all-platform quick scan completed
with 37 canonical game rows. Its API response listed Windows plus Nintendo 64,
Game Boy, PlayStation 2, PlayStation, Nintendo Switch, Wii and Xbox; the
browser platform selector exposed the same choices on desktop and mobile.
No tests or test suites were run before live UAT.
