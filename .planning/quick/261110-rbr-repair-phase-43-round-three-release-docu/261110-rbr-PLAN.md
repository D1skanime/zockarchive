---
id: 261110-rbr
title: Repair Phase 43 round-three release documentation and workflow contracts
mode: quick
status: complete
files_modified:
  - docs/zockarchive-branding-contract.md
  - .github/workflows/build.yml
  - .planning/STATE.md
---

# Quick Task 261110-rbr

Repair only the two round-three quality-gate regressions while keeping the
already approved beta-release scope and without publishing anything.

## Tasks

1. Add one literal `retain|docs/PORTAINER_INSTALL.md|...` record for the full
   release-image paragraph. It must exactly match the current line that names
   the GHCR beta image, the `:beta` alias, the prohibition of `:latest`, the
   unverified-source boundary, required-variable validation, and the local-only
   `ZA_IMAGE_REPOSITORY` override.
2. Restore the complete release workflow after the full-image build: define a
   separate Slim metadata action and Slim build action. Both Full and Slim
   metadata blocks must retain the exact GHCR and conditionally enabled Docker
   Hub image names, current ZockArchive OCI source/title/PC-and-console labels,
   the accepted `v0.1.0-beta.1` normalization, `0.1.0-beta.1` and `beta` tags
   with no `latest`, amd64/arm64 publication, and the existing ScreenScraper
   build-secret inputs. Keep Docker Hub login and publication conditional on
   both repository secrets while GHCR remains authoritative. The Slim flavour
   retains `suffix=-slim,onlatest=true`; do not alter or weaken tests.
3. Record the completed quick task and update the Quick Tasks section of
   `.planning/STATE.md`, then make one German commit containing the workflow,
   branding contract, planning artifacts, and state. Verify only with static,
   non-suite checks: YAML parsing, exact fixed-string/count checks for the
   metadata contracts and retained line, `git diff --check`, and review of the
   intended diff. Do not start tests, the host-contract wrapper, Docker,
   releases, tags, registry login, push, or publication.

## Acceptance

- The naming verifier has an exact allow-list record for the complete release
  image paragraph.
- The release workflow again contains exactly two OCI source/title metadata
  records and two Full/Slim registry metadata destinations, including the
  required Slim suffix contract.
- The beta-only tag, optional Docker Hub, authoritative GHCR, multi-architecture
  and ScreenScraper build-input behavior remain intact.
- A SUMMARY and STATE entry document the static-only verification and the
  commit without exposing secret values.
