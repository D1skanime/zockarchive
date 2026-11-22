---
quick_id: 261121-hd2
title: Rebind legacy Windows catalog identity for local soundtrack inventory
status: complete
created: 2026-11-21
completed: 2026-11-21
---

# Result

## Diagnosis

Read-only Dev inspection showed that ROM 43 retained the missing legacy identity
`pc-Games/Hades`, while the active Windows mapping was `pc`. Discovery correctly
found `pc/Hades`, but mapping identity did not match the legacy row. Creating a
new row was then blocked by the platform-wide unique game name, so no PC file
inventory ran and the local OST remained absent from `RomFile` and its download
component manifest.

## Implementation

- Added a guarded recovery that reuses a missing row only if an inactive mapping
  on the same storage root yields the exact same mapping-relative game suffix.
  It preserves the existing ROM, metadata and media ownership, moves its logical
  path to the active mapping and forces the normal PC-file rebuild.
- The recovery is deliberately not display-name based, cannot create a duplicate,
  and leaves non-matching missing rows untouched.
- Hardened lifecycle recovery for restart-orphaned RQ `STARTED` records: recovery
  proceeds only after the owned verifier is idle and every live worker denies
  ownership. It does not delete or bypass the execution fence.
- Updated the backend architecture documentation with both invariants.

## Evidence

- Before the repair, ROM 43 was missing at the inactive `pc-Games` mapping and
  had only `Hades.iso`. A normal Windows full scan rebuilt it at active `pc` and
  created the local `OST/Amityville horror.mp3` soundtrack file and extra
  component. The following Windows quick scan completed successfully.
- Desktop and 390 px mobile browser checks showed the local track in Media >
  Soundtrack. Adding it as background returned the protected file response
  (`206`); the audio was ready, unpaused and its playback time advanced.
- The Game Download dialog exposed OST as a selectable component. Selecting only
  that member created its manifest (`201`) and the browser received
  `Amityville horror.mp3` on desktop and mobile.
- Screenshots: `hades-ost-desktop-20261121.png`,
  `hades-ost-mobile-20261121.png`, `hades-download-dialog-desktop-20261121.png`,
  `hades-download-mobile-20261121.png`, and `hades-quick-desktop-20261121.png`
  in the job screenshots directory.

## Verification

- `python -m py_compile` passed for all changed backend modules.
- Scoped Trunk Ruff passed. The direct host frontend build was blocked by an
  existing read-only `node_modules/.vite-temp`; the same production build passed
  in the authorized Dev container. Frontend typecheck passed.
- No test suite or new automated test was run before the next Live UAT.

## Limitations

The Dev data already contained the inactive-to-active Windows mapping transition,
which exercised the exact recovery condition. No mapping was manually altered,
no NAS files were touched, and no production deployment occurred.
