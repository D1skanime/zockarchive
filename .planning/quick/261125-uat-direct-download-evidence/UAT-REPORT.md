# Isolated browser UAT report

Product head: `0e38e5cb574b74c55f85e9b79370551fe7ca774f`.

The retained evidence directory is `/tmp/za-261124-hds-browser/isolated/browser-proof`.

| Viewport | Direct-download evidence | Overview evidence |
| --- | --- | --- |
| Desktop, 1440x960 | `desktop-ZA-Direct-Small.rom`, 33 bytes, exact expected content | `desktop-overview-german.png`, `desktop-overview-english.png`, `desktop-overview-empty.png` |
| Mobile, 390x844 | `mobile-ZA-Direct-Small.rom`, 33 bytes, exact expected content | `mobile-overview-german.png`, `mobile-overview-english.png`, `mobile-overview-empty.png` |

The run clicked the semantic FileRow download control for `./ZA-Direct-Small.rom`. It observed and persisted each browser download. The adjacent copy-link control was separately located but not activated.

The isolated API and frontend temporarily used `http://127.0.0.1:3344` and `http://127.0.0.1:3345`; both were cleaned up after the run. No saved browser session or credentials are retained. HTTP clipboard support was not exercised and does not affect the download result.
