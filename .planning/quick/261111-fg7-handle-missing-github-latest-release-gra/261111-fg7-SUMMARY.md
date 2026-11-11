---
quick_id: 261111-fg7
phase: 43
status: complete
files_modified:
  - frontend/src/v2/components/Notifications/NewVersionBanner.vue
  - docs/FRONTEND_ARCHITECTURE.md
  - .planning/STATE.md
---

# Quick Task 261111-fg7 Summary

The version banner now treats the absent first GitHub release as a normal,
quiet state while preserving diagnostics for every other release API failure.

## Implementation

- `NewVersionBanner` returns before JSON parsing when the canonical
  `/releases/latest` request responds with HTTP 404.
- Other non-success status codes still throw into the existing `console.error`
  path, and the one-shot listener is removed from `finally` for every outcome.
- The frontend architecture guide records the silent 404 contract and retained
  observability for unexpected failures.

## Verification

- `git diff --check` passed.
- Scoped source inspection confirmed the 404 return precedes JSON parsing and
  the diagnostic catch, while non-404 non-OK statuses throw.
- Headless Playwright signed in through the normal form at 1440 px and 390 px.
  Both received the expected latest-release 404, rendered no version banner,
  logged no application-level latest-release error, and had no failed network
  request. Screenshots are `screens/new-version-404-desktop.png` and
  `screens/new-version-404-mobile.png`; the secret-free per-flow report is in
  the job evidence directory.
- No test file changed and no test command or test suite was run.

## Deviations

None. The browser's pre-login authorization diagnostics and generic browser
404 resource entry were observed but are outside this component's release
error path; the authenticated release check had no failed request and no
`Failed to fetch latest version from GitHub` console entry.
