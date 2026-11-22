---
quick_id: 261122-rah-tests
title: Test RAHasher archive inventory containment
status: complete
---

# Test RAHasher archive inventory containment

## Scope
Add direct coverage for the approved RAHasher error boundary without changing
production code.

## Steps
1. Simulate incomplete archive member evidence at the extraction boundary.
2. Assert that the optional RA hash is omitted and no RAHasher subprocess is
   launched.
3. Run the focused service and archive-helper tests, then record the result.

## Acceptance criteria
- `ArchiveReadError` returns the existing empty optional-hash outcome.
- The test uses the service boundary directly, not browser interaction.
- Only tests and GSD documentation change.
