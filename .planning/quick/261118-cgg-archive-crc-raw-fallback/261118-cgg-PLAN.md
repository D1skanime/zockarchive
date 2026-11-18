---
quick_id: 261118-cgg
status: in_progress
---

# Archive CRC raw fallback

1. Preserve the input CRC and hashers before member extraction, and return the
   untouched values if `ArchiveReadError` interrupts an archive inventory.
2. Add a focused handler test that interrupts after member data and verifies
   raw-file CRC, MD5, and SHA1 stability for different interruption points.
3. Run only that test file, inspect the running scan UI on desktop and mobile,
   then record the result in the quick summary and planning state.
