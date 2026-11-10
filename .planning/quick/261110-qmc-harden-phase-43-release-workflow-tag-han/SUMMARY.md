---
id: 261110-qmc
title: Harden Phase 43 release workflow and release-stack provenance
status: complete
date: 2026-11-10
commit: d7b83f62a
files_modified:
  - .github/workflows/build.yml
  - examples/portainer-release.yml
---

# Quick Task 261110-qmc Summary

The release workflow reads the event-controlled tag through `RELEASE_TAG`, uses only the content-read and package-write permissions it needs, and pins MariaDB 11.3 and Valkey 8.1 Alpine to immutable amd64/arm64 OCI image indexes.

## Completed Work

- Passed the published release tag through a step environment variable before Bash validation.
- Replaced unused OIDC and content-write permissions with `contents: read`; retained `packages: write` for GHCR publication.
- Pinned the release stack's MariaDB and Valkey images to reviewed OCI index digests and documented their amd64/arm64 compatibility beside each image.

## Verification

- PyYAML parsed `.github/workflows/build.yml` and `examples/portainer-release.yml` successfully.
- Static routing check confirmed the event tag is assigned only to `RELEASE_TAG` and then read as `TAG="$RELEASE_TAG"`.
- Static permission check confirmed there are no `id-token: write` or `contents: write` grants, with two `contents: read` and two `packages: write` declarations.
- Static image checks confirmed both expected immutable image references.
- `docker buildx imagetools inspect` confirmed each pinned index provides `linux/amd64` and `linux/arm64` manifests.
- `git diff --check` passed.

No release, registry login, image push, or automated test suite was run.

## Deviations from Plan

### Auto-fixed Issues

1. [Rule 3 - Blocking issue] Used PyYAML for static parsing because Ruby is not installed in the execution environment.

This preserved the requested static-only verification and did not add or install any package.

## Self-Check: PASSED

- Both changed product files exist in the checkout.
- Product commit `d7b83f62a` is reachable from the active job branch.
- The quick-task summary remains intentionally ignored by the repository's planning-artifact policy.
