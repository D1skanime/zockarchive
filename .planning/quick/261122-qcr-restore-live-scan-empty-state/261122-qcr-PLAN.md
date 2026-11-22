---
quick_id: 261122-qcr
title: Restore immediate live scan progress feedback
status: in_progress
---

# Plan

1. Restore the live-progress visibility contract so an accepted scan displays
   its empty scanning state before the first platform socket row arrives.
2. Keep completed transient platform rows visible for the existing subfolder
   action flow.
3. Verify the frontend typecheck, lint, production build, and the browser
   scan-start flow without adding tests before Live-UAT.
