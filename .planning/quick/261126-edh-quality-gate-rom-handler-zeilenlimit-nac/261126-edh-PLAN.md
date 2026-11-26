---
quick_task: 261126-edh
slug: quality-gate-rom-handler-zeilenlimit-nac
status: in_progress
---

# Restore the ROM handler baseline line count

1. Remove the redundant delegation comment introduced with the already-extracted
   mapped manifest path helper.
2. Confirm the existing ROM handler returns to its 1,306-line baseline and run
   scoped Trunk checks only.
3. Record the focused gate correction and commit it without changing tests.
