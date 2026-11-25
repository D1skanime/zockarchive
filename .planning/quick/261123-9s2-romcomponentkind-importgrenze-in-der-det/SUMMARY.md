---
id: 261123-9s2
status: complete
---

# Quick Task Summary

## Resolution

`PcAutomationQueueItemSchema` and `PcComponentSchema` both annotate values
with the canonical `models.rom.RomComponentKind`. The import was accidentally
removed during the line-limit extraction and is restored at their shared
response-model boundary.

## Verification

Focused Ruff, mypy, and changed-file Trunk checks passed with all four former
undefined-name diagnostics absent. No tests or test suites were run before
Live-UAT.
