---
quick_id: 261113-c9k
title: Quality-gate naming classification and host contracts
status: complete
---

# Quality-gate naming classification and host contracts

Classified the retained ScreenScraper compatibility line in the ZockArchive
branding contract without changing verifier behavior.

## Changes

- Added the exact `PGDP_SCREENSCRAPER_DEV_*` README line as a `retain` entry.
- Did not modify the naming verifier, host-contract verifier, or tests.

## Verification

- `bash scripts/verify-pgdp-naming.sh`: passed.
- `python3 backend/tools/ci_host_contracts.py`: passed after the source-contract
  commit, as required by its clean non-planning source-tree assertion.
- `git diff --check`: passed.

## Commits

- `62baa3eb1` `docs(za): classify ScreenScraper compatibility input`
- `b4499b461` `docs(za): record naming quality gate`

## Deviations

The host-contract command initially rejected the uncommitted contract source
change by design. The contract was committed before the final verification;
no verifier behavior was changed.
