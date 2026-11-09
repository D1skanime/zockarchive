---
quick_id: 261109-ebs
status: complete
phase: 41
---

# Post-acceptance scan regression repair

## Delivered

- Restored `ScanType` on the stable socket scan facade, preserving the
  production Phase 9 seed import after the scan-module split.
- Updated split-module regression tests to patch and assert their actual
  owners while retaining the RQ callable and stop-control coverage.
- Updated scan component and view tests to cover the bounded explorer and its
  extracted detail/status responsibilities without restoring a duplicate list.
- Accepted the deliberately localized scan namespace changes in the locale
  digest baseline.

## Verification

- `npm run typecheck` passed.
- `npm run test` passed: 173 files and 1,798 tests.
- Locale parity and locale sort checks passed.
- MariaDB CI shard 8 passed, including the affected scan socket, media and
  Phase 9 seed coverage. Temporary resources were cleaned successfully.
- Scoped `trunk fmt` and `trunk check --ci` passed.

The facade product correction requires renewed live UAT before merge.
