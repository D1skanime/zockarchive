---
id: 261110-qmc
title: Harden Phase 43 release workflow and release-stack provenance
mode: quick
status: ready
files_modified:
  - .github/workflows/build.yml
  - examples/portainer-release.yml
---

# Quick Task 261110-qmc

Resolve the Phase 43 code-review findings without publication or test-suite execution.

## Tasks

1. Pass the GitHub release tag through `RELEASE_TAG` environment data before shell validation, and reduce the workflow permissions to the read/package-write minimum used by the release path.
2. Pin the MariaDB 11.3 and Valkey 8.1 Alpine multi-architecture manifest lists in the release stack to the reviewed digests. Keep the version comments and image-only, amd64/arm64-compatible contract clear.
3. Perform static YAML, diff, tag-routing, permission, and image-digest checks. Do not run a release, registry login, image push, or automated test suite.

## Acceptance

- Event-controlled tags are never injected into workflow shell source.
- No unused `contents: write` or `id-token: write` permission remains.
- MariaDB and Valkey release dependencies have reviewed immutable multi-architecture image digests.
- No secret value is written to planning artifacts or output.
