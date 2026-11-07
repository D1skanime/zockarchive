---
quick_id: 261106-dm2
title: Repair the visible main-game cover
status: in_progress
parent_phase: 40
---

# Plan

1. Trace the browser-visible main-game Cover card to the persisted original
   cover response fields and determine why the rendered image is unavailable
   while the DLC cover is visible.
2. Correct the source-to-URL mapping without changing existing cover data,
   media ownership, or mutation behavior.
3. Verify the main-game and DLC cover tabs and their galleries again in the
   authenticated browser on desktop and mobile. Do not add or run tests.
