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

The saved completed operation was restored after a browser reload on both
viewports. Every one of the eight platform filters returned only its own rows:
Nintendo 64 (1), Game Boy (4), Windows (12), PlayStation 2 (4), PlayStation
(4), Nintendo Switch (4), Wii (4), and Xbox (4). The corresponding API pages
returned HTTP 200. The explorer remained one bounded 37-row page, with no
duplicate live list.

The login bootstrap still logs an expected unauthenticated 401 before the
normal form login. The local dev server also returns 404 for the pre-existing
Nintendo Switch platform SVG fallback. Neither request is a scan-operation
request and the stored-result flow produced no failed scan API request.
No tests or test suites were run before live UAT.
