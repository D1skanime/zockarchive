---
phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
plan: "02"
subsystem: infra
tags: [portainer, docker-compose, mariadb, valkey, ghcr]
requires:
  - phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
    provides: approved beta release image contract
provides:
  - image-only ZA, MariaDB, and Valkey Portainer stack
  - value-free inventory of release-stack variables
affects: [release-operator-documentation, isolated-uat]
tech-stack:
  added: []
  patterns: [health-gated Compose dependencies, required Portainer interpolation, explicit persistence boundaries]
key-files:
  created:
    - examples/portainer-release.yml
    - examples/portainer-release.env.example
  modified: []
key-decisions:
  - "The release stack pulls the exact GHCR beta image by default and reserves repository override for local proof only."
  - "ZA uses an external health-gated Valkey service, so the image entrypoint does not start its internal Valkey."
requirements-completed: [ZA-REL-43-03, ZA-REL-43-04]
duration: 3 min
completed: 2026-11-10
---

# Phase 43 Plan 02: Image-only Portainer release stack Summary

**A pull-only GHCR beta stack couples ZA with persistent MariaDB and Valkey services, while a value-free Portainer template protects secrets and host paths.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-11-10T18:12:00Z
- **Completed:** 2026-11-10T18:15:17Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Added a standalone Compose stack with no build context, Docker socket, permanent `pgdp-*` identity, or mutable image tag.
- Declared named volumes for MariaDB, ZA resources, and Valkey data, plus explicit writable config/assets binds and a read-only game-library bind.
- Required database passwords, authentication secret, and all host paths at Compose interpolation time.
- Added a value-free Portainer variable inventory, including local-proof-only image repository override and the embedded ScreenScraper build-input limitation.

## Task Commits

1. **Task 1: Define the image-only release stack and its persistence boundaries** - `775c04ac9` (feat)
2. **Task 2: Publish a value-free Portainer variable template** - `f326e17df` (docs)

## Files Created/Modified

- `examples/portainer-release.yml` - Pull-only ZA, MariaDB, and Valkey topology with health gates and persistence boundaries.
- `examples/portainer-release.env.example` - Value-free Portainer inventory for required secrets, host paths, defaults, and optional providers.

## Decisions Made

- Retained the application image entrypoint so its established migration and first-user setup behavior remains authoritative.
- Used `REDIS_HOST=za-valkey` and `REDIS_PORT=6379` to select the dedicated persistent Valkey service.
- Kept `ZA_IMAGE_REPOSITORY` optional and documented only for the later isolated local-image proof; normal deployment defaults to the GHCR beta image.

## Verification

- `docker compose --env-file <temporary mode-600 file> -f examples/portainer-release.yml config --quiet` passed. The temporary file was removed and no rendered configuration or values were output.
- Required interpolation failure was confirmed for the database passwords, authentication secret, and all three host-path variables without exposing Compose output.
- Static assertions confirmed image-only topology, no `latest`, no `build`, no Docker socket, no permanent `pgdp-*` identity, Valkey wiring, health-gated dependencies, named volumes, and the read-only library mount.
- Value-free template assertions confirmed all required release variables are present and all tracked password/auth-secret assignments are blank.
- `git diff --check` passed for the working tree and both task commits.

## Deviations from Plan

None - plan implementation and verification scope followed the approved contract.

## Issues Encountered

- Parallel Phase 43 work staged a workflow file while Task 1 was committed. The task commit was immediately amended to `775c04ac9`, containing only its Compose file; the workflow content was retained for its owner.
- A subsequent parallel HEAD advance caused a documentation-only template refinement to be included in `da795a1bf` alongside the Phase 43-01 workflow change. The primary Task 2 artifact commit remains `f326e17df`; the final template is value-free and passed all checks. No foreign workflow content was reverted or modified by this plan.

## User Setup Required

None - the tracked template names the operator-provided Portainer secrets and host paths, but no deployment was performed.

## Next Phase Readiness

The release stack is ready for operator documentation and the later isolated local-image UAT. No image build, registry login, tag, push, release, deployment, test suite, or permanent development resource was touched.

## Self-Check: PASSED

- Found `examples/portainer-release.yml` and `examples/portainer-release.env.example`.
- Found task commits `775c04ac9` and `f326e17df` in Git history.

---
*Phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation*
*Completed: 2026-11-10*
