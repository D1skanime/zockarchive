---
quick_id: 261122-qcr
title: Restore immediate live scan progress feedback
status: complete
completed: 2026-11-22
---

# Outcome

The live-progress section again stays visible while a scan is active or no
terminal operation snapshot exists. Its empty state now appears immediately
after acceptance, before the first platform socket row, while completed socket
rows remain available for subfolder actions.

## Verification

- `npm run typecheck`
- `trunk check src/v2/composables/useScanView/index.ts src/v2/components/Scan/ScanLiveProgress.vue`
- `npm run build`
- Real browser, desktop 1440px: normal quick scan immediately rendered the
  radar placeholder and completed with 44 of 44 games checked.
- Real browser, narrow 390px: the live card remained visible in the normal
  page flow.
- Screenshots: `screens/scan-live-start-desktop.png`,
  `screens/scan-live-desktop.png`, and `screens/scan-live-mobile.png`.

The browser logged the known anonymous `/api/users/me` 401 before form login;
after login there were no failed scan requests.
