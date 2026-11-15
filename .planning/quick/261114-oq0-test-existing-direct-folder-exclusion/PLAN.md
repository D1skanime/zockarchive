---
quick_id: 261114-oq0
status: in_progress
---

# Test existing direct-folder exclusion

## Objective

Add post-UAT backend contract coverage for changing an active direct Games
mapping to an explicit exclusion and mapping it back, without changing product
code.

## Steps

1. Extend the existing authenticated setup-recovery endpoint tests with the
   active mapping, exclusion, reload-state and remapping sequence.
2. Assert durable mapping and exclusion state, audit-safe inactive history, and
   preservation of unrelated active mappings. Keep the existing direct
   platform-to-platform conflict test as the error-path contract.
3. Run the new and affected setup test modules, record the result in the quick
   summary and project state, then commit only tests and planning artifacts.
