---
id: 261110-rbr
title: Repair Phase 43 round-three release documentation and workflow contracts
status: complete
date: 2026-11-10
---

# Quick Task 261110-rbr Summary

The beta-image installation paragraph now has an exact branding-contract retain
record, and the release workflow again builds and publishes matching Full and
Slim multi-architecture images from independent metadata outputs.

## Changes

- Added the literal independent-release image paragraph to the naming contract.
- Restored Slim metadata and build steps with `-slim` tags, conditional Docker
  Hub publication, authoritative GHCR output, and the existing build secrets.
- Kept the accepted beta version normalization, `0.1.0-beta.1` and `beta` tags,
  disabled `latest`, OCI source/title labels, and amd64/arm64 platforms in both
  image variants.

## Verification

- Parsed `.github/workflows/build.yml` as YAML.
- Checked the required retained paragraph and the Full/Slim metadata and build
  contracts with structural fixed-string checks.
- The earlier static check missed the host contract's newline-sensitive exact
  Docker Hub alias count. Quick task `261110-rgy` corrects that evidence gap.
- Ran `git diff --check` and reviewed the intended diff.
- No tests, test suites, Docker commands, registry operations, releases, tags,
  or pushes were started.

## Deviations

None. The task followed its approved static-only quick plan.
