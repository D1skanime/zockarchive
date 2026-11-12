---
id: 261112-bob
status: complete
completed: 2026-11-12
commits:
  - ef220d60e
---

# Native completed-setup Scan activation, Summary

The completed-setup Scan CTA now remains a native `ZABtn` button and uses one
named click handler for pointer, Enter, Space, and controller-derived click
activation.

## Implementation

- `Setup.vue` uses `startScan()` to navigate with `{ name: ROUTES.SCAN }`.
  The completed-setup CTA has no `to` prop and no custom keyboard handler.
- `FRONTEND_ARCHITECTURE.md` records the native completion action and the
  authoritative completed-admin route-exit contract.
- `useSetupRouteGuard/index.ts` was inspected and remains unchanged.

## Verification

- `git diff --check` passed.
- No tests or test suites were created, modified, weakened, or run.
- Normal runtime login, then pointer and focused Enter activation, reached the
  rendered `/scan` view at 1440 px and 390 px. The affected flows had no
  console errors or failed requests.
- Sanitized screenshots and the corrected browser record are retained at
  `/home/d1sk/ki-run/data/jobs/za/261111-98c5/screens/` and
  `/home/d1sk/ki-run/data/jobs/za/261111-98c5/sichtpruefung.md`.

## Known Limitation

The persistent UAT service is already setup-complete, so the unrelated
first-step exclusion and platform-search flow was not reset or simulated.

## Commits

- `ef220d60e` fix: Scan-Start per Tastatur aktivieren

## Self-Check: PASSED

The focused source files and this summary exist. Both the source correction
(`ef220d60e`) and its planning record (`25a7010a8`) exist in Git.
