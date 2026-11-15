---
quick_id: 261114-p3q
status: in_progress
---

# Restore scan readiness after exclusions

## Objective

Keep a reachable direct-Games library scannable after an intentionally
excluded platform has no active storage mapping. Route the Scan page's library
action directly to the Games tab and remove the duplicate mapping call to
action.

## Steps

1. Reproduce the completed-scan blocked state in the authenticated browser and
   trace the reported platform-mapping response without exposing credentials.
2. Adjust readiness handling so a missing mapping for an excluded or otherwise
   unassigned platform does not turn valid saved direct mappings into an error.
   Preserve real root and mapping health failures.
3. Point the single Scan-page library action to `?tab=direct`, remove the
   obsolete duplicate mapping action, update affected architecture guidance,
   and typecheck.
4. In the browser at desktop and mobile widths, verify Wii remains excluded,
   pc remains Windows, two sequential quick scans complete and remain startable
   after reload, and the sole library link opens Games with direct folders.
   Record screenshots and the factual outcome in the job sight-check report.
