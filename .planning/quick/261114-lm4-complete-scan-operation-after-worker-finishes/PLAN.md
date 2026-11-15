---
quick_id: 261114-lm4
status: complete
---

# Complete a successful scan operation after the worker finishes

## Objective

Prevent a successful, fully processed normal scan from being converted into an
interrupted and then `source_unverifiable` operation before the worker commits
its terminal status.

## Steps

1. Capture the precise worker and durable-operation transition that leaves a
   completed scan in the active execution slot.
2. Repair only that lifecycle boundary, preserving cancellation, lost-worker
   fencing and immutable source checks.
3. Inspect normal desktop and mobile browser scan behaviour, direct-folder
   navigation and catalog results. Do not add or run tests before live UAT.
