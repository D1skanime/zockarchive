# Complete a successful scan operation after the worker finishes — Summary

**Quick ID:** 261114-lm4
**Status:** Complete

## Result

A mapped scan now uses the mapping-backed logical path and filename for every
existing-ROM lookup, not just collection-expanded paths. A direct folder rename
therefore cannot attach a same-named ROM from the prior catalog path and make
the Windows inventory binding reject the completed operation.

## Verification

- Python syntax compilation and `npm run typecheck` passed. No test suite was
  run before live acceptance.
- A normal authenticated browser scan completed with eight platforms, 37 ROMs
  and 29 operation items. Its terminal state was `completed`, with no active
  scan lock.
- Authenticated desktop and mobile browser inspection confirmed the Games
  view, all affected tabs, `pc`/Windows, the `Nicht scannen` choice, scan-start
  availability and the catalog without post-login console or network errors.

The job sight-check report contains the screenshot inventory and exact browser
outcomes.
