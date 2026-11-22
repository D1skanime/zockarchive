---
quick_id: 261122-klq
title: Add direct post-UAT tests for selected-child completion fencing
status: complete
completed: 2026-11-22
---

# Outcome

The runner recovery retained the staged direct test. It exposed a normal-return
control-flow defect in `protect_identification_completion`: `return await`
left the nested `try` before `completion.finalize()` ran. The wrapper now saves
the result, finalizes the bound checkpoint, and then returns it.

The retained direct contracts cover normal finalization, exactly-once explicit
completion, post-scan errors, and checkpoint write errors. Targeted MariaDB
tests and Trunk checks passed.

## Verification

- `trunk check backend/handler/scan_identification_completion.py backend/tests/handler/test_scan_identification_completion.py`
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_scan_identification_completion.py tests/integration/test_scan_collection_promotion.py -q`
