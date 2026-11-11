---
phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
plan: "04"
subsystem: release-uat
tags: [docker, compose, portainer, browser, persistence]
requires:
  - phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
    provides: image-only Portainer stack and release operator documentation
provides:
  - isolated local amd64 full-image and Compose readiness evidence
  - browser-ready temporary Portainer CE UAT handoff
affects: [release-operators, human-uat]
tech-stack:
  added: []
  patterns: [owner-only temporary handoff, exact image binding, isolated browser container]
key-files:
  created:
    - .planning/phases/43-za-beta-release-f-r-unabh-ngige-portainer-installation/43-UAT.md
  modified: []
key-decisions:
  - "The browser proof used a temporary named Playwright container in the isolated UAT network because the host has no browser executable."
  - "The managed-media proof uses the existing authenticated browser/CSRF workflow and a harmless generated PNG, retaining only its non-secret identifier and route."
requirements-completed: []
metrics:
  duration: 0min
  completed: 2026-11-10
  tasks: 3
  files: 2
---

# Phase 43 Plan 04: Isolated release UAT Summary

**A uniquely tagged local amd64 release image reaches browser-visible first-user setup and leaves an isolated Portainer CE initial-administrator handoff active, with four verified persistence boundaries including a browser-uploaded managed resource.**

## Accomplishments

- Built and identity-checked the exact local amd64 `full-image` candidate, then started it only in a fresh `za-phase43-*` Compose project.
- Proved browser-visible initial setup, completed first-user setup, and confirmed that a ZA-only recreate preserves the database setup state, config marker, Valkey value digest, and browser-uploaded managed-media ID/content route.
- Started exact digest-pinned Portainer CE on a separate loopback port. Its API returned a JSON version and its initial-administrator form was browser-inspected.
- Left all temporary UAT and Portainer resources running for human UAT. No permanent `pgdp-*` resource, Team4s/NAS path, registry, publication, tag, push, or test suite was touched.

## Verification

- `npm run typecheck` passed.
- The full amd64 Docker image build passed, including its image-owned production frontend build.
- `GET /api/heartbeat` returned HTTP 200 with setup required before browser enrollment and setup not required after ZA-only recreation.
- Before/after equality passed for database setup ID/state, config marker name/digest, and Valkey key/value digest.
- An authenticated browser session uploaded a harmless generated PNG through the canonical CSRF-protected media endpoint. Managed resource `id=3` and `/api/roms/1/media/3/content` were identical before/after ZA-only recreation; the post-recreate content request returned `image/png`.
- Browser captures were inspected for the initial setup wizard, completed setup view, post-recreate login state, and Portainer initial-administrator form.
- Portainer `GET /api/status` returned HTTP 200 JSON with a non-empty `Version`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Isolated Docker client state from a read-only global Buildx directory**
- **Found during:** Task 1
- **Issue:** Docker Buildx could not update its global activity timestamp under the job environment.
- **Fix:** Used protected Docker client metadata under the already owner-only temporary UAT directory.
- **Verification:** The exact amd64 full-image build and image architecture inspection passed.

**2. [Rule 3 - Blocking] Used an isolated temporary browser container**
- **Found during:** Task 2
- **Issue:** No host browser executable was present for mandatory real-browser inspection.
- **Fix:** Started only `za-phase43-*` temporary Playwright browser containers in the isolated Compose network, using the repository's already installed Playwright node module read-only.
- **Verification:** Inspected non-secret screenshots of the setup wizard, completed state, login state after recreate, and Portainer initial-administrator form.

**Total deviations:** 2 auto-fixed, both blocking-environment remedies. **Impact:** Isolation and proof scope were preserved.

## Issues Encountered

- Direct host `npm run build` fails because the pre-existing empty `frontend/dist` is owned by `nobody:nogroup` and not writable by the runner. Workbox consequently finds no generated assets. The supported equivalent `npm run build -- --outDir <temporary Phase 43 path>` and clean Docker full-image frontend builds pass, so no unrelated PWA source change was made.
- The optional arm64 Buildx attempt failed at the emulator-stage Alpine package command with exit 255. amd64 is verified; arm64 remains non-blocking.

## Next Phase Readiness

- Human UAT can visit the active loopback Portainer route in `43-UAT.md` and complete only its own initial administrator form.
- Do not approve a release or cleanup until the retained isolated stack has been reviewed by the human UAT process.

## Self-Check: PASSED

- The UAT receipt and this summary exist at their required Phase 43 paths.
- The referenced local amd64 image and temporary Portainer endpoint remain active.
