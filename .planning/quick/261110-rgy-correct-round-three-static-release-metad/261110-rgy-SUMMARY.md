---
id: 261110-rgy
title: Correct round-three static release metadata contracts
status: complete
date: 2026-11-10
---

# Quick Task 261110-rgy Summary

The release workflow retains conditional Docker Hub publication while exposing
the two stable alias anchors required by the static host contract.

## Changes

- Added one YAML comment anchor for the optional Docker Hub alias beside each
  Full and Slim metadata block.
- Preserved the functional destinations with their existing
  `USE_DOCKERHUB == 'true'` conditions.
- Corrected the previous quick-task record to state that its structural check
  missed the newline-sensitive alias-count requirement.

## Verification

- Parsed `.github/workflows/build.yml` as YAML.
- Confirmed two conditional Docker Hub destinations, two exact static alias
  anchors, two GHCR destinations, two OCI source labels, and the Slim suffix.
- Ran `git diff --check` and reviewed the intended diff.
- No tests, test suites, Docker commands, registry operations, releases, tags,
  or pushes were started.

## Deviations

None. The task followed its approved static-only quick plan.
