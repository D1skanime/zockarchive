---
id: 261124-fls
title: PS3-Downloadlogik nach Live-UAT testen
status: in_progress
---

# Quick Plan

1. Add direct filesystem-path and PS3 inventory synchronization tests, including
   the verified, skipped, and rejected states.
2. Extend the manifest endpoint tests for the authorized PS3 whole-folder
   request, its argument boundary, and the inventory failure response.
3. Run only the newly added and directly affected test files, then record the
   result in the Quick summary and project state.
