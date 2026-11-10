---
id: 261110-rgy
title: Correct round-three static release metadata contracts
mode: quick
status: complete
files_modified:
  - .github/workflows/build.yml
  - .planning/quick/261110-rbr-repair-phase-43-round-three-release-docu/261110-rbr-SUMMARY.md
  - .planning/STATE.md
  - .planning/quick/261110-rgy-correct-round-three-static-release-metad/261110-rgy-SUMMARY.md
---

# Quick Task 261110-rgy

Correct the final static publication-contract regression without changing tests,
altering release behavior, or publishing an image.

## Tasks

1. In `.github/workflows/build.yml`, retain the conditional Docker Hub metadata
   destination in both Full and Slim `docker/metadata-action` blocks, and add a
   concise YAML comment immediately adjacent to each block that contains the
   exact literal Docker Hub alias `name=d1skanime/pc-game-download-portal` on
   its own line. The comments document the stable published alias for the
   static host contract; they must not replace, disable, or make unconditional
   the existing `enable=${{ env.USE_DOCKERHUB == 'true' }}` behavior. Preserve
   GHCR, beta-only tags, disabled `latest`, OCI labels, multi-architecture
   platforms, secret inputs, and conditional Docker Hub login.
2. Correct the prior `261110-rbr` SUMMARY and its STATE entry so they no longer
   claim that the exact Docker Hub literal-count check passed. Record that the
   earlier static verification missed the contract's newline-sensitive literal
   requirement, without asserting a test-suite result or exposing any secret.
3. Create this task's SUMMARY and update the Quick Tasks table in
   `.planning/STATE.md`. Verify only with static, non-suite checks: parse the
   workflow as YAML; confirm the functional conditional Docker Hub destination
   appears twice; confirm the exact literal `name=d1skanime/pc-game-download-portal\n`
   count is two; confirm two GHCR destination lines, two OCI source labels, and
   the Slim suffix; run `git diff --check` and inspect the intended diff. Do
   not run tests or the host-contract wrapper, and do not start Docker, release,
   tag, registry login, push, or publication operations.

## Acceptance

- The existing publication test's exact Docker Hub alias count is satisfied by
  documented static contract anchors while the executable metadata remains
  conditional on both Docker Hub secrets.
- Full and Slim images retain their current optional Docker Hub and
  authoritative GHCR behavior.
- The historical quick-task evidence is accurate, and this quick task has a
  SUMMARY and STATE record with static-only verification evidence.
