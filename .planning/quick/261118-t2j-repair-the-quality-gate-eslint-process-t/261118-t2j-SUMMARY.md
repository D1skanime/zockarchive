---
quick_id: 261118-t2j
title: Repair ESLint process termination in locale parity test
status: complete
---

# Summary

## Cause

The repository-specific ESLint command replaced Trunk's upstream ESLint command
without `batch: true`. It also enabled the TypeScript project service although the
active ESLint rule set does not use type information. On the large branch diff this
launched separate, memory-intensive project services. The quality gate killed one
such process with signal `-9` before ESLint could report a source diagnostic.

## Implementation

Restored batching in `.trunk/trunk.yaml` and removed the unused project-service
activation from `frontend/eslint.config.js`. Selected frontend files now share one
ESLint invocation without allocating type-program state that no active rule reads.
No test assertion, locale validator, or application code changed.

## Verification

- Direct cached ESLint invocation for
  `frontend/src/v2/composables/useManualDescription/provenance.locales-parity.test.ts`:
  passed with zero diagnostics.
- Targeted `trunk check` for that file: passed.
- `trunk check --ci` for the 118 files changed from `main...HEAD`: passed with
  no new issues (one pre-existing issue retained).
- No test suite was run.
