---
quick_id: 261116-review01
status: complete
completed: 2026-11-16
---

# Quick task summary

The direct owned-publication proof had a deterministic budget defect: its
caller supplied digest and byte size to the child verifier but opened the proof
scope with zero expected bytes, leaving every full-byte verification at the
two-second fixed allowance. The call now supplies the known size and one
record to the existing finite scope. This preserves the capped budget and all
proof integrity checks.

Mapped archive failures now do not prevent legacy platforms from scanning in a
mixed operation. Both groups continue independently and any archive failures
are raised together only after both groups finish. Python syntax compilation
and the scoped Trunk check passed. The running Scan UI was opened and operated
on desktop and mobile after the correction; its reference dialog and scan
action had no browser console or failed-network errors. No test or test suite
was created or run.
