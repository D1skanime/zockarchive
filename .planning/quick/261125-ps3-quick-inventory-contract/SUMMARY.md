---
id: 261125-ps3-quick-inventory-contract
status: complete
date: 2026-11-25
commit: e63988bc2
---

# Restore the established PC and PS3 quick-scan inventory contract

The shared-download scan authorization now keeps the established PC and PS3
paths available during the normal `ScanType.QUICK` lifecycle, while additional
platforms remain excluded from that new inventory path until a non-quick scan.

## Implementation

- `scan_handler.py` authorizes reconciliation only for non-metadata scans
  outside the Windows quick context. PC and PS3 bypass the scan-type exclusion;
  additional platforms still require a non-quick scan before the existing
  size-based eligibility policy can run.
- `BACKEND_ARCHITECTURE.md` documents the split between the legacy PC/PS3
  contract and the additional-platform quick-scan boundary.
- No downloader transport, endpoint, capability policy, authentication, or
  test was changed.

## Verification

- `trunk check backend/handler/scan_handler.py backend/handler/scan_folder_download.py docs/BACKEND_ARCHITECTURE.md` passed with no new issues.
- An isolated MariaDB/Redis harness performed a real standard Quick scan of a
  small PS3 folder game and a small NES game. Its seed asserted a PS3 `FOLDER`
  component and no `FOLDER` component for the below-threshold NES game.
- Desktop and mobile browser flows used the semantic `Game Download` tab and
  `Game herunterladen` button. Both profiles reached the PS3 shared-folder
  dialog with `Erweiterter Ordner-Download`; the NES fixture exposed neither a
  Game Download tab nor its dialog.
- Evidence: `$TMPDIR/za-261124-hds-browser/isolated/browser-proof/quick-inventory-contract/`.
  The stack was isolated and temporary; API/Vite ran only for the foreground
  browser step on `127.0.0.1:3344` and `127.0.0.1:3345`.

## Manual replay

1. Run a normal Quick library scan containing a PS3 folder game and a small
   additional-platform ROM.
2. Open the PS3 game, select `Game Download`, then `Game herunterladen`.
   The shared folder mode must be available.
3. Open the small additional-platform ROM. It must not gain a Game Download
   tab solely from that Quick scan.

## Deviations

None. The first isolated evidence attempt found only a harness eager-loading
issue and was rerun with the established detailed ROM lookup; no product code
was changed for that harness repair.

## Self-Check: PASSED

- Commit `e63988bc2` exists.
- Desktop and mobile evidence files exist at the documented temporary path.
