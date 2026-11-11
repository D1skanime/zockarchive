---
phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
plan: "03"
subsystem: documentation
tags: [portainer, release, ghcr, docker-hub, valkey, persistence]
requires:
  - phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
    provides: beta OCI publication and image-only Portainer stack contracts
provides:
  - separate Git-source and image-only Portainer operator documentation
  - human-gated beta release procedure with image limitation disclosure
affects: [release-operators, future-beta-publication, portainer-uat]
tech-stack:
  added: []
  patterns: [exact-image-tag updates, persistent-state boundaries, entrypoint-owned first start]
key-files:
  created:
    - docs/RELEASE.md
  modified:
    - docs/PORTAINER_INSTALL.md
    - docs/BACKEND_ARCHITECTURE.md
    - examples/README.md
decisions:
  - "The retained Git-source and independent image-only Portainer contracts remain explicitly separate."
  - "Future release publication requires explicit human approval after isolated UAT and uses GHCR exact beta tags, never latest."
metrics:
  duration: 9min
  completed: 2026-11-10
  tasks: 2
  files: 4
---

# Phase 43 Plan 03: Release Image Documentation Summary

**Operators can now distinguish the retained Git-source stack from the future image-only GHCR beta stack, including durable storage boundaries and a human-gated release procedure.**

## Accomplishments

- Added a separate release-image Portainer path with exact GHCR beta tag guidance, required Portainer variable names, empty-database browser setup, health-gated MariaDB and Valkey, and safe image updates.
- Documented all release-stack state boundaries: MariaDB, Valkey, and resources named volumes; writable configuration and asset bind mounts; and the read-only source library mount.
- Added the future release sequence, optional Docker Hub behavior, `latest` prohibition, and the ScreenScraper developer-argument image limitation.
- Updated the backend architecture to assign configuration, migration, first-user setup, and durable-state responsibility to the correct tier without a Docker socket.

## Task Commits

1. **Task 1: Document the independent Portainer release-image install and persistence contract** - `49ab9b1bf` (docs)
2. **Task 2: Record release control, architecture ownership, and known limitations** - `a95175b00` (docs)

## Files Created/Modified

- `docs/PORTAINER_INSTALL.md` - Separates source and image-only installation, persistence, first start, and exact-tag updates.
- `examples/README.md` - Provides concise navigation and boundaries for both deployment contracts.
- `docs/RELEASE.md` - Defines the future approval-gated beta release procedure and known image limitation.
- `docs/BACKEND_ARCHITECTURE.md` - Records deployment ownership, external Valkey selection, entrypoint lifecycle, and storage trust boundaries.

## Verification

- `git diff --check` passed before each task commit.
- Static Markdown checks confirmed `portainer-release.yml`, the authoritative GHCR path, `0.1.0-beta.1`, `beta`, the prohibition on `latest`, first-user setup, and Valkey guidance.
- Static release and architecture checks confirmed the future human-gated sequence, optional Docker Hub behavior, ScreenScraper limitation, `REDIS_HOST=za-valkey`, and no-Docker-socket boundary.
- A textual secret scan found no populated ScreenScraper developer inputs or release database/auth values in the modified documentation.
- No test suite, publication, tag, registry login, image build, deployment, or runtime resource action was performed.

## Decisions Made

- Keep the release stack's `:beta` alias limited to the approved beta series while directing routine deployment updates to an exact reviewed tag.
- Describe Docker Hub only as an optional workflow destination that cannot block GHCR when either credential is absent.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. The documentation describes the future publication boundary without claiming a currently published image.

## Self-Check: PASSED

- Confirmed all four documentation files exist in the working tree.
- Confirmed task commits `49ab9b1bf` and `a95175b00` exist in the current branch history.
- This summary is intentionally untracked because `.planning/` is ignored; it was not force-added.
