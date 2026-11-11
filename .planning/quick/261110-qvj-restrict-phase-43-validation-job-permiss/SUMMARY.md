---
id: 261110-qvj
title: Restrict Phase 43 validation job permissions
status: complete
date: 2026-11-10
commit: b4cbfab91
files_modified:
  - .github/workflows/build.yml
  - .planning/phases/43-za-beta-release-f-r-unabh-ngige-portainer-installation/43-REVIEW.md
---

# Quick Task 261110-qvj Summary

The release-tag validation boundary now has an explicit read-only GitHub token, while the image publishing boundary alone retains package publication authority.

## Completed Work

- Removed the workflow-level `packages: write` grant.
- Declared `contents: read` as the only permission for `validate-tag-semver`.
- Retained `contents: read` and `packages: write` only on the `build` job that publishes the image.
- Updated the Phase 43 review artifact to classify the documented ScreenScraper build-credential inclusion as the explicit accepted beta-product limitation. The ScreenScraper build arguments remain unchanged.

## Verification

- PyYAML parsed `.github/workflows/build.yml` successfully.
- Static assertions confirmed the workflow default and validation job are exactly `contents: read`, and the publishing job alone has `packages: write`.
- `git diff --check` passed.

No build, release, registry login, image push, or automated test suite was run.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- `.github/workflows/build.yml` exists and commit `b4cbfab91` is reachable on the active job branch.
- The quick-task summary and review artifact remain ignored planning artifacts by repository policy.
