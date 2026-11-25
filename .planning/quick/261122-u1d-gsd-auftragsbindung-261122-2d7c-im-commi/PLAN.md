---
id: 261122-u1d
title: GSD-Auftragsbindung 261122-2d7c im Commit nachführen
status: in_progress
---

# Quick Plan

1. Confirm the required job-to-phase binding exists locally and identify why
   the quality gate cannot see it.
2. Commit `.planning/ki-run/261122-2d7c.json` with the exact job ID and the
   Phase 47 relative directory, plus this quick-task record and STATE entry.
3. Verify the committed file and JSON shape without running tests.
