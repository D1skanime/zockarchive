---
quick_id: 261106-dm2
status: complete
parent_phase: 40
---

# Summary

The main-game cover tab received the raw persisted original-cover path. Browser
image requests therefore did not use the protected resources route. The
response schema now converts retained small and large original-cover paths to
the same resources URL shape as the established cover response fields. It does
not modify cover records, ownership, selections, or stored media.

## Browser verification

- Authenticated `GET /api/roms/24` exposed all retained original-cover fields;
  the large path used the resources route and returned HTTP 200.
- The main-game cover rendered with natural width 600 on desktop and mobile.
- The DLC cover rendered with natural width 810 on desktop and mobile.
- Preview click opened and the localized close action closed both cover
  galleries on desktop and mobile.
- No automated tests were added or run, as required for this live-UAT repair.
