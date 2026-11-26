---
status: complete
---

The existing shared dialog now renders a translated neutral label for FOLDER groups
instead of its storage sentinel. Empty single-file member paths use the already-loaded
ROM filename. The parent detail view passes that filename through PcComponents without
changing selection, manifest, queue, or downloader contracts.

Focused verification passed: frontend typecheck, focused Trunk lint, and the directly
affected DownloadAccessibility test file (10 tests).
