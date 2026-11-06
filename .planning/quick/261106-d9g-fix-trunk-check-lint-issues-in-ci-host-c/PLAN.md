---
quick_id: 261106-d9g
title: Fix host-contract lint findings
status: in_progress
parent_phase: 40
---

# Plan

1. Replace the lint-invalid `os.sys` and delayed imports in
   `ci_host_contracts.py` with explicit standard-library imports and a
   validated `uv` executable path.
2. Preserve the Python-3.13 re-execution behavior and every host-contract
   assertion, without suppressing the lint findings broadly.
3. Run only the affected Trunk check and the host-contract command, then
   commit the correction and record the exact result in `SUMMARY.md`.
