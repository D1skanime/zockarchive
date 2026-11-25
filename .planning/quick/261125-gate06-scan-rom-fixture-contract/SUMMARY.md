---
id: 261125-gate06-scan-rom-fixture-contract
status: complete
scope: test-and-planning-only
product_head: 30da371f3
---

# Gate06 Scan-ROM fixture contract summary

The Steam scan fixtures now model the persisted Windows ROM contract while
keeping metadata tests focused on their own behavior.

## Cause and correction

`scan_rom` calls shared-download reconciliation after persistence. The four
`SimpleNamespace` values returned by the two Steam tests lacked the strict
`Rom.has_simple_single_file` property, which caused the reproduced
`AttributeError`.

The persisted and reloaded doubles now provide the simple `.exe` contract:
`has_simple_single_file`, `fs_path`, `fs_name`, and `components`. This exposed
the real inventory boundary: these metadata fixtures intentionally do not own
a physical game file. The tests therefore mock only
`reconcile_scanned_shared_download_inventory`, a separately covered
side-effect, and assert its exact persisted-ROM, Windows-platform,
authorization, and storage invocation. Existing timestamp, media, final-write,
and automation assertions remain unchanged.

No product code, fallback, skip, integrity check, or existing assertion was
weakened.

## Verification

Both commands ran with the disposable Phase34 MariaDB runner, not SQLite:

```text
uv run python backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_scan_handler.py -k 'test_steam_media_reconciliation_uses_the_persisted_rom_timestamp or test_steam_scan_defers_automation_until_the_final_scan_write'
Result: 2 passed, 37 deselected

uv run python backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_scan_handler.py
Result: 39 passed
```

No full backend suite ran. The disposable runner cleaned its temporary
resources after each command.

## Files changed

- `backend/tests/handler/test_scan_handler.py`
- `.planning/quick/261125-gate06-scan-rom-fixture-contract/PLAN.md`
- `.planning/quick/261125-gate06-scan-rom-fixture-contract/SUMMARY.md`
- `.planning/STATE.md`

## Deviations from plan

The first property-only correction correctly reached the existing inventory
boundary, revealing that the reloaded doubles also need the fields read by the
shared-download path. The Steam tests do not create storage sources, so the
authorized minimal isolation asserts the boundary call instead of introducing
an unrelated file fixture.

## Self-check: PASSED

The summary, plan, state entry, and test fixture changes are present. Targeted
MariaDB verification passed.
