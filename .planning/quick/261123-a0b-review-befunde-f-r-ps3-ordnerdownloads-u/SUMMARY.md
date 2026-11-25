---
id: 261123-a0b
status: complete
---

# Quick Task Summary

## Resolution

Response preparation now strips the FOLDER component before either list or
detail serialization, while preserving its aggregate folder-download
capability on details. Whole-folder manifest capture runs in a worker thread,
leaving the async request loop responsive. PC local-image selection is mounted
in the Media cover panel, not the Game Download panel.

## Verification

Focused changed-file Trunk checks and frontend typecheck passed. Per the
project browser policy, the Media-tab local-image action is handed to human
Live-UAT separately from Game Download. No tests or test suites were added or
run before Live-UAT.
