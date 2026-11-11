---
id: 261111-ghs
status: complete
completed: 2026-11-11
---

# Quick Task 261111-ghs Summary

Post-acceptance regression coverage directly protects the accepted release
lookup lifecycle and the independent Portainer release contracts.

## Delivered

- Added direct `NewVersionBanner` lifecycle coverage for non-semver builds,
  quiet 404 responses, observable non-404 failures, and one-shot listener
  cleanup without browser-input simulation.
- Added focused workflow coverage for general optional-`v` SemVer validation,
  prerelease-only `beta` aliases, and disabled `latest` aliases.
- Added focused release-stack coverage for the authoritative GHCR image,
  required variables, named assets/configuration volumes, optional host-path
  overrides, and the documented fixed `/romm/...` boundary.

## Verification

- `cd frontend && npm test -- src/v2/components/shared/ProjectBrand.test.ts`
  passed: 1 file, 14 tests.
- `cd backend && uv run pytest tools/tests/test_phase38_publication.py tools/tests/test_phase38_operator_docs.py`
  passed: 17 tests.
- `git diff --check` passed.

## Deviations

None. The plan was implemented as written. The initial scoped Python run
identified an escaped test regex and a newline-sensitive documentation assertion;
both test assertions were corrected before the final passing run.

## Self-Check: PASSED

The three planned test files and this Quick summary exist. No product, workflow,
Compose, or documentation file was modified.
