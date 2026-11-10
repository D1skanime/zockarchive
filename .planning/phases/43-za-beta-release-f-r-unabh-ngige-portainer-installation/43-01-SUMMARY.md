---
phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
plan: "01"
subsystem: ci-cd
tags: [github-actions, docker, ghcr, docker-hub, buildx, release]
requires: []
provides:
  - "A published-release workflow restricted to v0.1.0-beta.1 and beta OCI tags"
  - "Unconditional GHCR publication with optional all-or-nothing Docker Hub routing"
affects: [43-03-release-documentation, release-publication, portainer-installation]
tech-stack:
  added: []
  patterns:
    - "Validate and normalize a release tag before rendering OCI metadata"
    - "Use one secret-conjunction guard for every optional registry path"
key-files:
  created: []
  modified:
    - .github/workflows/build.yml
key-decisions:
  - "Only the normalized exact beta tag and beta alias are published, never latest or SemVer aliases."
  - "GHCR remains the unconditional release destination; Docker Hub is enabled only when both existing credentials are non-empty."
patterns-established:
  - "Release metadata is derived from the validation job's normalized output."
  - "Registry-specific metadata and login share the USE_DOCKERHUB condition."
requirements-completed: [ZA-REL-43-01, ZA-REL-43-02]
duration: 18min
completed: 2026-11-10
---

# Phase 43 Plan 01: Published Beta OCI Workflow Summary

**Published GitHub prereleases now accept only v0.1.0-beta.1, publish normalized 0.1.0-beta.1 and beta tags, and keep GHCR independent of optional Docker Hub credentials.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-11-10T18:09:46Z
- **Completed:** 2026-11-10T18:27:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Restricted the published-release event path to the approved optional-v beta tag and exposed its normalized value to downstream metadata.
- Removed slim, major, minor, and latest routes while retaining pinned Actions, the full-image target, dual amd64/arm64 output, and secret-only ScreenScraper arguments.
- Made GHCR unconditional and gated both Docker Hub login and its sole image target on the same two-secret conjunction.

## Task Commits

The two workflow tasks were committed together in `e2fc1d619` after a shared-index race with the parallel stack plan was repaired. The resulting commit contains only `.github/workflows/build.yml` and covers both tasks.

## Files Created/Modified

- `.github/workflows/build.yml` - Validates the exact beta release contract, emits only raw normalized and beta metadata tags, and routes optional Docker Hub publication without blocking GHCR.

## Decisions Made

- Used the validation job's `normalized` output for metadata labels, raw image tags, and the backend version substitution so every release consumer sees `0.1.0-beta.1`.
- Kept Docker Hub as the existing sole optional repository target and used `USE_DOCKERHUB` for both its login and metadata line.

## Verification

- Passed `git diff --check` for both task diffs.
- Confirmed the release event, exact `v?0.1.0-beta.1` validation, normalized output, raw exact/beta tags, `latest=false`, full-image target, dual architecture platforms, and ScreenScraper secret arguments with static `rg` inspection.
- Confirmed the Docker Hub two-secret condition, conditional login and metadata target, unconditional exact GHCR target, and absence of slim, latest, major/minor, Docker namespace, and `docker.io` routes with static `rg` inspection.
- No release, tag, workflow run, registry login, image build/push, deployment, or automated test suite was executed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Concurrent Phase 43 work briefly mixed files in the shared branch history. Coordination rebuilt the affected commits without discarding work; the final `e2fc1d619` commit contains only `.github/workflows/build.yml`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The release image contract is ready for the later documentation and human publication procedure in Plan 43-03.
- Publishing remains intentionally deferred until human acceptance and merge.

---
*Phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation*
*Completed: 2026-11-10*

## Self-Check: PASSED

- Summary exists locally at the required phase path.
- Commit `e2fc1d619` exists in the current branch history and contains only `.github/workflows/build.yml`.
- The summary is intentionally untracked because `.planning/` is ignored; it was not force-added.
