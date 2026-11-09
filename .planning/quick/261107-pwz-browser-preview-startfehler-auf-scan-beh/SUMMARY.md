---
id: 261107-pwz-browser-preview-startfehler-auf-scan-beh
status: blocked
date: 2026-11-07
---

# Quick Summary: Scan Preview Bootstrap Diagnosis

## Result

No Phase 41 source change was applied. The reported startup failure is caused
by an incomplete synthetic-preview API fixture, not by the scan overview.

When the preview returns an object for the collection-list endpoint, the
existing global bootstrap fails before scan data is evaluated:

```
TypeError: collections.find is not a function
at src/stores/collections.ts:77:36
```

`fetchCollections()` requires `/api/collections` to return an array. The
synthetic preview must provide `[]` for an empty library, just as the existing
screenshot fixture does. This issue is outside Phase 41's scan UI sources.

## Verification

- All 18 changed scan locale files were parsed with `jq`; each new
  `operation-*` value is a string.
- `npm run typecheck` passed.
- A temporary-cache Vite preview loaded `/scan` without the reported error
  until deliberately given the malformed collection response, which reproduced
  the failure and source stack above.
- `npm run build` still stops in `vite-plugin-pwa` because Workbox finds no
  precache or runtime-cache configuration. This is an independent existing
  preview-build blocker, not a scan source error.
- No tests or test suites were added or run before live UAT.

## Deferred

The owner of the synthetic browser-preview fixture must ensure every global
bootstrap endpoint uses its production response shape, specifically an array
for `/api/collections`. Re-run the synthetic 1,000-game scan presentation
after that fixture correction.
