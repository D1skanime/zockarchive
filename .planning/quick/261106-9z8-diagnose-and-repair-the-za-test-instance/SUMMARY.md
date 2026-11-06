---
quick_id: 261106-9z8
status: complete
---

# ZA UAT backend recovered

`RomComponentOwnedMedia.component` and `RomOwnedMedia.rom` now each declare
their owner foreign key. This removes the ambiguous relationship caused by the
new active-owned-cover references. After restarting only `pgdp-dev`, the
backend heartbeat became reachable again. `trunk check backend/models/rom.py`
and `git diff --check` passed. No test suite ran before UAT.
