---
id: 261125-uat-direct-download-evidence
status: complete
product_head: 0e38e5cb574b74c55f85e9b79370551fe7ca774f
scope: harness-and-evidence-only
---

# Quick Summary: Correct direct-download and Overview evidence

The product source snapshot used by the isolated evidence run was `0e38e5cb574b74c55f85e9b79370551fe7ca774f`. No production file, test, Dev instance, authentication data, or database was changed. The subsequent commit contains only this GSD evidence documentation.

## Evidence corrected

- The harness uses the actual German accessible file-row button name `./ZA-Direct-Small.rom herunterladen`, selected with an exact `getByRole("button", { name, exact: true })` locator.
- It separately identifies, and does not click, `Download-Link für ./ZA-Direct-Small.rom kopieren`. Clipboard behavior is therefore neither a download assertion nor a download failure.
- At `1440x960` and `390x844`, Playwright observed a browser `download` event, saved `ZA-Direct-Small.rom`, and verified the exact 33-byte content `ZA small direct download fixture\n`.
- Real Overview screenshots for both profiles show the German description, the English fallback description, and the empty description state without a technical fallback/provider message.
- The misleading old `desktop-under-overview.png` and `mobile-under-overview.png` evidence files were removed. The replacement evidence is under `/tmp/za-261124-hds-browser/isolated/browser-proof`.

## Harness boundary

The disposable local browser URLs were `http://127.0.0.1:3344` (API) and `http://127.0.0.1:3345` (Vite). They existed only during the isolated run and were cleaned up afterwards. The retained UAT path is registered as `path za-261124-hds-browser/isolated` in `/tmp/ki-uat-keep.txt`.

No Clipboard API result was used. HTTP clipboard availability is deliberately outside the direct-download evidence.

## Verification

- Isolated harness completed with `PASS cleanup and source immutability`.
- Browser screenshots were visually inspected for the active Overview tab and the Files tab at desktop and mobile dimensions.
- No tests or test suites were started.

## Human UAT

1. In the current Dev UI, open a small non-PC game, choose **Files**, and activate the download-arrow button for a file. Confirm the browser saves the file, rather than opening the link-copy flow.
2. At desktop and mobile widths, open a German description, an English-only fallback, and an empty-description game. Confirm Overview shows only available description text and no technical provider or fallback notice.
