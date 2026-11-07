---
status: complete
quick_id: 261107-quality-gate-lint-and-sizing
phase: 41
---

# Quick Task Summary: Repair new lint and source-size findings

## Completed

- Replaced the `Depends()` argument default in the scan-operation endpoint with a module-level dependency singleton, resolving the new Ruff B008 finding.
- Split the scan socket monolith into pipeline and socket-handler modules while retaining a small compatibility facade and old RQ task-name recognition.
- Split scan-operation persistence/result work into focused database-handler modules.
- Moved scan result-query normalization from the API adapter into a dedicated typed module while retaining public exports.

## Result

- `backend/endpoints/sockets/scan.py`: 63 lines.
- `backend/handler/database/scan_operations_handler.py`: 415 lines.
- `frontend/src/v2/data/adapters/scanOperations.ts`: 440 lines.

## Verification

- Targeted Trunk check for the changed backend modules passed.
- Targeted Python `compileall`, frontend typecheck, and `git diff --check` passed.
- No tests or test suites were added, changed, or started before live UAT.
