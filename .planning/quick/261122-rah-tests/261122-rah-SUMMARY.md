---
quick_id: 261122-rah-tests
title: Test RAHasher archive inventory containment
status: complete
---

# Test RAHasher archive inventory containment

## Result
Added a direct `RAHasherService` contract test for incomplete archive-member
evidence. It simulates `ArchiveReadError` at the extraction boundary and
asserts the existing safe outcome: no optional RA hash and no RAHasher
subprocess.

## Verification
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 600
  tests/adapters/services/test_rahasher.py tests/utils/test_archives.py`
  passed in the disposable target.
- `trunk check backend/tests/adapters/services/test_rahasher.py` passed.

Only test and GSD planning files changed. No full suite ran.
