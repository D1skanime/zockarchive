---
status: complete
quick_id: 261126-rqo
---

# Quick Task Summary: Recover Edit ROM after provider-media conflict

The independent review finding was confirmed. An Edit ROM metadata-ID update
can persist its canonical metadata before provider-media publication returns an
HTTP 409. The dialog previously treated that response as an ordinary failed
edit and closed without replacing the stale Pinia ROM record.

`EditRomDialog` now uses the existing `useOwnedMediaRefresh()` recovery
contract. A recovered provider-media conflict updates the ROM collection and
the active ROM detail route from the canonical server record, then reports the
translated partial-publication failure with the original backend detail. The
existing generic error and close behavior remains unchanged for non-provider
errors and failed canonical refreshes. No backend, API, locale, or architecture
contract changed, so no product architecture documentation update was needed.

## Verification

- `trunk check src/v2/components/Dialogs/EditRomDialog.vue`: passed, no issues.
- `npm run typecheck`: passed.
- No test suite was run, as required before renewed live acceptance.
- Browser interaction was not performed. This host exposes no supported browser
  binary or browser-control capability, so visual UAT remains for the
  authorized human flow.

## Commits

- `38f9d1161 fix(za): Edit-ROM-Medienkonflikt abgleichen`

## Self-Check: PASSED
