---
quick_id: 261120-ira
title: Stop isolated browser harness work and verify authentication path
status: in_progress
---

# Stop isolated browser harness work and verify authentication path

1. Remove only the isolated browser-harness containers, network and volumes created for this job; preserve the shared `pgdp` stack and existing browser image.
2. Statically trace the login and library-management route to determine whether the current branch's changes can cause the reported `GET /api/users/me` 401.
3. Run typecheck, targeted lint and production build without browser automation or tests; record the result and Dev UAT handoff.
