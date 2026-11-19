---
quick_id: 261119-fwx
title: Retain scan subfolder actions and classify unmatched results
status: in_progress
---

# Plan

1. Reproduce the terminal Scan view against the supplied Dev data and trace why
   PC subfolder actions vanish after a completed operation, and why completed
   console games without metadata do not match the Unidentified result filter.
2. Keep the existing subfolder action reachable until navigation or reload,
   classify metadata-free completed games as Unidentified in the durable
   operation projection, and correct confirmed misplaced popup anchoring.
3. Inspect the terminal result, filter, dialog, and popup behavior in normal
   desktop and mobile browsers. Record the evidence and commit without adding
   or running tests before UAT.

# Acceptance criteria

- A completed Scan still exposes the PC subfolder selection action until the
  user leaves or reloads the page.
- Completed games without metadata identity appear under Unidentified.
- Select menus remain anchored to their activators while scrolling.
