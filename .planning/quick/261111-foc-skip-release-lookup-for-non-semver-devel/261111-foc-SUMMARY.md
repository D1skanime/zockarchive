---
quick_id: 261111-foc
phase: 43
status: complete
files_modified:
  - frontend/src/v2/components/Notifications/NewVersionBanner.vue
  - docs/FRONTEND_ARCHITECTURE.md
  - .planning/STATE.md
---

# Quick Task 261111-foc Summary

Development builds with a non-semver runtime version no longer request a
release that cannot be shown, while valid release versions retain the existing
latest-release workflow.

## Implementation

- `NewVersionBanner` derives one stable validity flag from the running version.
- Non-semver builds neither register the `network-quiesced` listener nor fetch
  the latest-release endpoint, including on a direct future invocation.
- Valid semver builds retain the canonical endpoint, quiet 404 handling,
  diagnostic handling for other failures, and unconditional unmount cleanup.
- The frontend architecture guide documents the responsibility boundary.

## Verification

- Scoped source inspection confirmed invalid versions cannot register the
  listener or issue the request, and valid versions retain the existing 404,
  error, and cleanup paths.
- `git diff --check` passed.
- Headless Playwright used the normal login form at 1440 px and 390 px. Both
  viewports sent zero latest-release requests, logged zero component release
  errors, rendered no version banner, and produced the recorded screenshots.
- No test file changed and no test command or test suite was run.

## Deviations

None.
