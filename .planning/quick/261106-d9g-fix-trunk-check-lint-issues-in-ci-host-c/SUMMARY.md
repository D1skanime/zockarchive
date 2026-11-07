---
quick_id: 261106-d9g
status: complete
parent_phase: 40
---

# Summary

`ci_host_contracts.py` used `os.sys`, deferred imports after executable code,
and a partial-path `execvpe` call. The Python-3.13 handoff now uses explicit
standard-library imports, validates the `uv` executable with `shutil.which`,
waits for the fixed-argument child command, and exits only after it succeeds.
All host-contract assertions remain unchanged.

## Verification

- `trunk check backend/tools/ci_host_contracts.py` passed with no issues.
- `python3 backend/tools/ci_host_contracts.py && git diff --exit-code HEAD -- . ':!.planning' && git status --short` passed on commit `6a7c84c12`.
- Evidence: `/home/d1sk/ki-run/data/jobs/za/261103-4b37/tmp/za-host-contracts-9wz6yyla/host-contracts.json`, 26 host-contract tests passed with no failures, errors, or skips.
