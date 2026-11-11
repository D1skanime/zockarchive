---
id: 261111-ef8
status: complete
completed: 2026-11-11
---

# Quick Task 261111-ef8 Summary

The independent Portainer release stack now needs only its three secrets and a
read-only library path for normal operation. Assets and configuration use
persistent named volumes by default, with optional advanced host-path overrides.

## Delivered

- Generalized release-tag validation to Semantic Version tags, with exact version
  tags, prerelease-only `beta`, no `latest`, matching GHCR outputs and optional
  `d1skanime/zockarchive` Docker Hub output.
- Added a standalone German Portainer release guide, shortened the legacy
  Git-source guide to its compatibility role, and recorded release evidence and
  limitations in German.
- Updated the affected static contract assertions without adding or weakening
  tests.
- Ran YAML parsing, a non-secret release Compose render, the naming verifier and
  `git diff --check`. No test suite was started.

## Isolated installation proof

The disposable `za261110self` Compose project used the existing local
`za-phase43-uat:db73013a19c1481c5fdd95cf` image and a fresh empty MariaDB
volume. The first-start UI was inspected at 1440 px and 390 px. Only the ZA
service was recreated; the sample library, named asset/configuration data and
running application persisted. All explicitly named self-test containers,
network and volumes, plus its temporary path, were removed afterwards.

## Retained human UAT environment

A fresh, undeployed Portainer CE initial-admin page remains at localhost port
49000. The secret-free handoff is
`/home/d1sk/ki-run/data/jobs/za/261110-0413/portainer-uat-handoff.md` and the
retention manifest contains only its container, volume and temporary sample path.
Desktop and mobile screenshots of the initial-admin page are in the job screen
directory. No stack was deployed in this retained environment.

## Known limitations

The local arm64 image was not built because the local emulator failed. GitHub
Actions is responsible for its first multi-architecture build after approval.
The known local npm-build environment issue and optional Docker Hub credentials
remain documented. Full regression remains deferred until human approval.

## Deviations

The local Ruby and Node YAML parsers were unavailable, so the installed PyYAML
parser was used for the same non-test YAML syntax check. This did not change the
release contract or add dependencies.

## Self-Check: PASSED

The changed stack, workflow, guides, branding contract and affected contract
assertions exist. The retained human environment and handoff are outside the
repository and intentionally not committed.
