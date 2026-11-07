---
quick_id: 261106-mz7
status: complete
date: 2026-11-06
---

# Gate 37 correction summary

`store_resource()` now narrows a missing response MIME type before its GIF/WebP
lookup. This is a type-safety correction only: a missing type still leaves the
resource path unchanged and still cannot satisfy format validation.

The DLC detail hero resolver now lives in `pcDlcMediaPresentation.ts`, next to
the other component-media presentation rules. It keeps an explicitly selected
component-owned cover authoritative and only falls back to local media when
there is no selected owned cover. `PcDlcDetail.vue` is 578 physical lines,
below the gate baseline of 582.

## Verification

- `trunk check backend/handler/filesystem/resource_download.py frontend/src/v2/components/GameDetails/PcDlcDetail.vue frontend/src/v2/components/GameDetails/pcDlcMediaPresentation.ts`
  completed with `Checked 3 files` and `No issues`.
- No tests or test suites were added or run, as required during the active
  human-UAT window.
- No architecture-document update is required: this extracts an existing
  feature presentation rule without changing the documented data flow, route,
  persistence, or user-visible contract.
