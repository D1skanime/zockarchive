---
quick_id: 261119-fwx
title: Retain scan subfolder actions and classify unmatched results
status: complete
completed: 2026-11-19
---

# Summary

- Kept transient Scan platform rows for the current page lifetime after a
  terminal operation snapshot, so their Windows subfolder picker remains
  reachable until the user reloads or leaves the Scan page.
- Completed canonical game records now persist their metadata-identity fact.
  The durable operation projection classifies a recorded `false` fact as
  Unidentified for every platform, while retaining the existing Windows
  inventory fact and never treating missing evidence as a match.
- The shared select popup uses Floating UI fixed positioning, automatic
  scroll updates, flip, shift, and size middleware. Desktop and mobile Dev
  browser checks confirmed the Scan type popup stays anchored to its trigger.
  The supplied Dev instance did not retain a terminal operation-result panel
  with the UAT CPS3 rows at inspection time, so its exact terminal filter and
  PC-folder action remain the next live-UAT confirmation.

Targeted Trunk checks passed. No test suite was added or run before live UAT.
