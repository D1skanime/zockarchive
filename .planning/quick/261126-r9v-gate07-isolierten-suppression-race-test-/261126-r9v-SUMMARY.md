---
status: complete
quick_id: 261126-r9v
---

# Quick Task Summary: Isolate Gate07 provider-media suppression race

Gate07's isolated MariaDB failure was reproduced before changing the fixture:
`test_suppression_generic_delete_during_download` failed because the seeded
provider row stayed active and `operator_suppressed` was false. The pre-change
fixture requested the same canonical IGDB screenshot identity as the seeded row.

The evidence branch is test-only. The revised test reads the active inventory
for that seeded identity and proves its non-empty owned path. It then requests a
distinct screenshot identity, records one awaited download callback, deletes the
seeded media with the refresh version inside that callback, and retains the
existing tombstone, suppression, placement, and temporary-file cleanup checks.
No product code or product documentation changed.

The existing metadata contract continues to prove that a matching usable cover
is reused without a download while the distinct missing screenshot is retried
and reconciled. It now also records that inventory lookup occurs once per
refresh.

## Verification

- `python3 backend/tools/phase34.py backend --dialect mariadb tests/handler/test_provider_media_suppression.py::test_suppression_generic_delete_during_download -q`
  initially reproduced the failure: 1 failed.
- The same named isolated command after the fixture correction: 1 passed.
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_provider_media_suppression.py tests/handler/metadata/test_rom_media.py -q`:
  31 passed, 2 pre-existing warnings.
- `trunk check backend/tests/handler/test_provider_media_suppression.py backend/tests/handler/metadata/test_rom_media.py --no-fix`:
  no issues.

Gate07, shards, and full regression were intentionally not started. The retained
isolated runner receipts are under the job temporary directory.

## Commit

- `1d7c7f024 test(za): Gate07-Suppression-Race korrekt auslösen`

## Self-Check: PASSED
