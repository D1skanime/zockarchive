---
quick_id: 261118-ctp
status: in_progress
---

# Remove archive CRC test import suppression

1. Remove the `noqa`-suppressed startup import from the focused CRC recovery
   test without changing its hash assertions.
2. Run a targeted static check only, record the no-test pre-UAT constraint, and
   commit the correction with the Quick summary and state entry.
