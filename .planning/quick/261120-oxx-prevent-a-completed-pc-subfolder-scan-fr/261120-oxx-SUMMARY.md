---
quick_id: 261120-oxx
title: Prevent a completed PC subfolder scan from being rediscovered and falsely matched
status: complete
completed: 2026-11-20
---

# Summary

- Found the lifecycle gap: an existing Windows child selected from a parent
  container can take the quick-inventory `REUSE` or `METADATA_ONLY` branch.
  That branch previously skipped `_identify_rom`, so it also skipped the
  collection completion fence and left the parent eligible for the next quick
  scan.
- The selected child is now finalized through the existing completion fence in
  that branch only after its mapping id, revision, command scope, and durable
  child path all match the explicit collection-promotion intent. Finalization
  records the child result and atomically retires the parent; ordinary quick
  reuse stays unchanged.
- Updated the backend architecture description of this parent-retirement
  invariant.
- `npm run typecheck`, scoped `trunk check`, and the containerized production
  frontend build passed. No tests were added or run before the renewed UAT.
- Browser attempts at 1440 px and 390 px used the normal supplied test-login
  form, but Dev returned HTTP 401 from `/api/users/me` after submission. The
  Scan page and the Tales action were therefore unavailable, and this browser
  verification remains explicitly open in the job sight-inspection report.
