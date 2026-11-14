# Preserve completed setup after direct-folder discovery changes — Summary

**Quick ID:** 261114-kvw
**Status:** Complete
**Commit:** `24564f19a`

## Result

- Setup recovery now distinguishes completed-account/root health from the mutable
  inventory of direct Games children. Renaming a direct child or discovering a
  new one therefore does not redirect a completed administrator to `/setup`.
- A newly discovered direct child is projected into the Games tab as a visible,
  pending row. It shows its suggested platform, keeps the selection unsaved
  until the administrator confirms it, and still offers `Nicht scannen`.
- Saving a complete current direct-child selection retires only vanished direct
  mappings/exclusions; nested mappings remain outside this maintenance path.
- Backend architecture documentation records the recovery and audit-trail
  contract.

## Verification

- `npm run typecheck` completed successfully (`vue-tsc --noEmit`). No test suite
  was run before live acceptance.
- Authenticated desktop browser: `/library-management?tab=direct` stayed on
  Library Management after the live `pc-Games` → `pc` rename. `pc` was visible
  as Windows, saved, and remained Windows after reload.
- Authenticated mobile browser (390 px): the Games view stayed on Library
  Management, displayed `pc` / Windows, and opened the selector containing
  `Nicht scannen`; no post-login console errors or failed requests occurred.
- A normal browser scan was accepted and processed seven platforms / 21 ROMs;
  the catalog then displayed 38 games across eight platforms, including 13
  Windows games. The operation subsequently became `blocked` with
  `source_unverifiable` after its worker had processed all entries. This is
  documented as an observed scan-lifecycle limitation, not represented as a
  successful terminal scan.

Evidence is recorded in the job sight-check report and screenshots.
