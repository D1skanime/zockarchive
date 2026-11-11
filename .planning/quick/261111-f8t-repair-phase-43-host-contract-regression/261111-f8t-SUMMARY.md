---
id: 261111-f8t
status: complete
completed: 2026-11-11
---

# Quick Task 261111-f8t Summary

The host-contract provenance rule now checks the independent release guide, the
document that tells operators to deploy only a reviewed GHCR image.

## Delivered

- Added an explicit German warning that image sources outside the reviewed GHCR
  release are not verified (`unverified`) and must not be deployed.
- Kept the retained Git-source-stack compatibility assertions in
  `PORTAINER_INSTALL.md` and moved only the existing provenance assertion to the
  release-guide group.
- Added no test and did not run a test suite during the live-acceptance freeze.

## Verification

- `git diff --check` passes.
- `python3 -m py_compile backend/tools/tests/test_phase38_operator_docs.py`
  passes. This is syntax compilation only, not a test execution.
- The reviewed diff leaves `docs/PORTAINER_INSTALL.md` unchanged, documents the
  provenance rule in the standalone German release guide, and retains the exact
  `unverified` assertion in its new owning document group.

## Deviations

None. The plan was implemented as written.

## Self-Check: PASSED

The changed guide, existing contract file and Quick plan/summary artifacts exist.
