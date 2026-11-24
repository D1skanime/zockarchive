---
id: 261124-gz5
status: complete
---

# Quick Task Summary

## Outcome

Restored the list-response projection for ordinary PC download components.
Neutral folder components are now excluded before gallery hydration, so their
manifest members cannot be loaded or serialized on library pages. Detail
responses retain the existing aggregate folder capability.

The focused test contracts now preserve the accepted console-tab predicate,
the complete `RomComponentKind` enum, the router module surface required by
the Media tab, and the approved localized download-mode wording.

## Verification

- Targeted frontend Vitest: 37 passed.
- Isolated MariaDB backend target: 68 passed.
- Targeted Trunk format and check: no issues.

## Documentation

No architecture document changed: the existing backend and frontend
architecture descriptions already state the restored list/detail boundary and
the shared manifest workflow.
