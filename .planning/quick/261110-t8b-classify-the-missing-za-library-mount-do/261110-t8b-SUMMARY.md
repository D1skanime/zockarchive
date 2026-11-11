---
id: 261110-t8b
status: complete
completed: 2026-11-11
commit: 6e3e9d44b
---

# Quick Task 261110-t8b Summary

The independent beta image contract now consistently uses
`ghcr.io/d1skanime/zockarchive` for workflow publication metadata and the
default Portainer release image.

## Completed work

- Changed both full and slim GHCR workflow destinations to the ZockArchive
  package path while preserving the conditional Docker Hub alias.
- Updated the image-only Portainer stack, its environment example, release
  documentation, and examples to the same authoritative path.
- Replaced stale branding-contract retain records and preserved the single
  byte-identical `ZA_LIBRARY_PATH` read-only mount retain record.
- Updated existing release and operator-document assertions without adding,
  removing, or weakening tests.

## Verification

- `bash scripts/verify-pgdp-naming.sh` passed.
- `python3 -m unittest -v backend.tools.tests.test_phase38_verifiers backend.tools.tests.test_phase38_publication backend.tools.tests.test_phase38_operator_docs` passed, 21 tests.
- `git diff --check` passed.

## Deviations from plan

One stale `examples/README.md` retain record was corrected after the naming
verifier identified its byte mismatch. The updated record matches the existing
documentation and does not add an exception.

## Commits

- `6e3e9d44b` `fix: ZA-Release-Imagepfad vereinheitlichen`

## Self-check: PASSED

The implementation commit exists and this summary records only the focused
checks authorized for the correction.
