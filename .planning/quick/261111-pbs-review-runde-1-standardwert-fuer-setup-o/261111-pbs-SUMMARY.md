---
phase: quick-261111-pbs
plan: 01
subsystem: setup API and constrained live UAT
tags: [pydantic, setup, compatibility, documentation, uat]
requires: []
provides:
  - Legacy setup disposition defaults
  - Sanitized browser and Docker branding evidence
affects: [setup assistant, storage mappings, setup recovery]
tech_stack: [FastAPI, Pydantic, Playwright]
key_files:
  created:
    - /home/d1sk/ki-run/data/jobs/za/261111-98c5/uat-review-01.md
    - /home/d1sk/ki-run/data/jobs/za/261111-98c5/screens/review-01-setup-desktop.png
    - /home/d1sk/ki-run/data/jobs/za/261111-98c5/screens/review-01-setup-mobile.png
  modified:
    - backend/endpoints/responses/setup.py
    - docs/BACKEND_ARCHITECTURE.md
decisions:
  - Omitted legacy dispositions use the existing platform handler branch.
  - Auth-gated Step 1 is reported rather than bypassed with credentials or state mutation.
metrics:
  tests_run: 0
  browser_viewports: 2
---

# Quick Task 261111-pbs: Setup disposition default and review UAT summary

Both public setup schemas now convert an omitted legacy disposition into the established
platform behavior, while explicit exclusions remain strict. The constrained UAT produced
desktop and mobile browser evidence and documents the current authenticated-route blocker
without altering persistent setup or container state.

## Completed work

- Added `default="platform"` to `SetupFolderAssignmentSchema.disposition` and
  `SetupFolderMappingSchema.disposition`.
- Documented the omission compatibility contract in the backend architecture guide.
- Captured the live `/setup` route at desktop and mobile widths.
- Recorded the authenticated-route blocker and the observed live `[ZockArchive]` log
  prefix in a sanitized UAT report.

## Verification

- `git diff --check` passed.
- Structural schema and documentation assertions passed.
- No test or test suite was run, as required.
- Playwright navigation of the live route returned HTTP 200 and redirected to the Login
  view in both viewports.

## Deviations from Plan

### Reachability blocker

The planned Step 1 interaction could not start because `/setup` redirects an
unauthenticated browser to Login. The review forbade reading credentials, cookies,
authorization headers, or environment values, so no login or persistent-state workaround
was attempted. The report records the required follow-up authority.

### Docker-init observation limit

The bounded live log query confirmed the `[ZockArchive]` application log prefix. Its
rolling window contained no init-banner line, so no unverified init-banner claim is made.

## Known Stubs

None.

## Self-Check: PASSED

The modified schemas and architecture guide, the sanitized report, and both PNG evidence
files exist. Commit verification is recorded in the execution handoff after the atomic
commit is created.
