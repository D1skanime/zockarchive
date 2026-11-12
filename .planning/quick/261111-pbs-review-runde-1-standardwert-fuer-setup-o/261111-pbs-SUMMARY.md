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
    - /home/d1sk/ki-run/data/jobs/za/261111-98c5/screens/review-01-authenticated-setup-desktop.png
    - /home/d1sk/ki-run/data/jobs/za/261111-98c5/screens/review-01-authenticated-setup-mobile.png
  modified:
    - backend/endpoints/responses/setup.py
    - docs/BACKEND_ARCHITECTURE.md
decisions:
  - Omitted legacy dispositions use the existing platform handler branch.
  - Completed persistent setup is reported rather than bypassed with state mutation.
metrics:
  tests_run: 0
  browser_viewports: 2
---

# Quick Task 261111-pbs: Setup disposition default and review UAT summary

Both public setup schemas now convert an omitted legacy disposition into the established
platform behavior, while explicit exclusions remain strict. Step 1 was not live verified
in this job service because its setup was already complete; by the locked human decision,
feature and update-path UAT move to the existing Portainer stack without a temporary
First-Run instance.

## Completed work

- Added `default="platform"` to `SetupFolderAssignmentSchema.disposition` and
  `SetupFolderMappingSchema.disposition`.
- Documented the omission compatibility contract in the backend architecture guide.
- Preserved the prior authenticated `/setup` screenshots as evidence only of the
  completed setup state.
- Updated the sanitized UAT report with concrete German feature-UAT and Portainer
  update-path checklists, without changing runtime infrastructure.

## Verification

- `git diff --check` passed.
- Structural schema and documentation assertions passed.
- No test or test suite was run, as required.

## Deviations from Plan

### Human-approved UAT handoff

After normal-form login, `/setup` rendered the completed persistent-setup state in both
viewports. The application provides no supported non-mutating return path to Step 1, so
the folder exclusion, search, pointer/keyboard selection, persistence, and scan checks
were not executed in this job service. The locked human decision declines a temporary
First-Run instance and assigns both feature UAT and update-path UAT to the existing
Portainer stack. The sanitized report provides the German checklists and explicitly
forbids a DB reset or volume deletion.

### Docker-init observation limit

The bounded live log query confirmed the `[ZockArchive]` application log prefix. Its
rolling window contained no init-banner line, so no unverified init-banner claim is made.
The Portainer checklist confines the future observation to the ZockArchive banner/prefix
and migrations and deliberately does not invent an image tag.

## Known Stubs

None.

## Self-Check: PASSED

The modified schemas and architecture guide, the sanitized report, and desktop/mobile
PNG evidence for both unauthenticated and authenticated routes exist. The
implementation/documentation commit `c049d0981` and the planning/UAT commit
`1313efcdd` exist in the job branch history.
