---
quick_id: 261114-oq0
status: complete
---

# Test existing direct-folder exclusion

## Coverage

- The authenticated setup endpoint now has a contract test for converting an
  active direct PC mapping to an exclusion, reloading its administrative
  projection, and mapping it back to Windows.
- The test verifies the original mapping becomes inactive, the exclusion is
  persisted and later removed, and the unrelated PSP mapping remains active.
- The retained conflict path explicitly asserts its `409
  setup_assignment_conflict` response. Scan command coverage verifies that two
  direct folders assigned to one platform yield exactly one command each.

## Verification

The isolated Phase 34 backend invocation completed for the endpoint, handler,
and integration modules. Its disposable services were cleaned up afterwards.
No product code changed in this quick task.
