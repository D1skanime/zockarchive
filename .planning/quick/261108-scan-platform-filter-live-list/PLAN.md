---
quick_id: 261108-scan-platform-filter-live-list
status: complete
phase: 41
---

# Quick Task: Restore platform-filtered scan results after live UAT

- Bind `platform_id` as a positive, URL-coercible query value while retaining strict positive IDs for request contracts.
- Keep terminal scan results in the paginated explorer and retain the legacy live rows only while a scan is active, so a completed large scan cannot create a second unbounded list.
- Verify the actual completed scan in the local browser on desktop and mobile: all platforms, Windows, then all platforms again.

No tests or test suites run before live UAT.
