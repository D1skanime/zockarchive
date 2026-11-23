---
id: 261123-a0b
title: Review-Befunde für PS3-Ordnerdownloads und lokale Medienkorrektur beheben
status: complete
---

# Quick Plan

1. Keep folder manifest members out of both list and detail component payloads.
2. Move whole-folder manifest capture off the asynchronous request event loop.
3. Restore local-image selection in the PC Media tab and verify the affected
   backend and frontend gates without adding tests.
