---
quick_id: 261107-quality-gate-lint-and-sizing
status: in_progress
phase: 41
---

# Quick Task: Repair new lint and source-size findings

## Findings

- Replace the new `ruff/B008` `Depends()` argument default.
- Extract focused responsibilities from the three newly enlarged production files so no file remains above the 450-line policy.

## Constraints

- Preserve scan behavior and public contracts.
- Do not add, weaken, or run tests before live UAT.
- Use targeted static checks only and record actual results.
