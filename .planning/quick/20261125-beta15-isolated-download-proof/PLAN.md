---
id: 20261125-beta15-isolated-download-proof
title: Isolated Beta15 runtime and browser download proof
status: incomplete
scope: disposable-harness-and-evidence
---

# Quick Plan

Run a fresh, disposable Phase34 MariaDB/Redis/browser harness for the Phase 49 shared-download lifecycle. It must establish a legacy folder with normal persisted RomFiles but zero FOLDER components, members, and manifests; then prove desktop 1440 and mobile 390 PS3-folder/PS3-ISO, other-platform threshold, authorized POST, source verification, regular manifest, real queue download, and fail-closed cases. No configured library, Dev instance, NAS, production database, or permanent service may be used.

## Current execution state

The fresh 2026-11-25 run used generated MariaDB/Redis resources, a copied checkout, and a synthetic PS3 folder plus below-threshold NES file below the job temporary directory. Its Quick scan completed, the seed asserted a PS3 FOLDER component and no NES FOLDER component, and API/Vite were ready only in the disposable loopback stack at ports 3344/3345. Playwright reached desktop PS3 tab/dialog and below-threshold pages, then mobile PS3 tab.

The execution host terminated the foreground harness before it completed. Cleanup removed generated resources and transient receipts. This partial run is not accepted as the required proof. Existing `/tmp/za-261124-hds-browser/isolated` helper evidence was inspected only to reuse its semantic browser approach and is not relabelled as a fresh Beta15 result. A resume must retain sanitized receipts before cleanup and execute every listed scenario.
