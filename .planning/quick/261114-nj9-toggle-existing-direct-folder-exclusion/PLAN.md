---
quick_id: 261114-nj9
status: in_progress
---

# Toggle an existing direct-folder exclusion

## Objective

Repair the completed-setup assignment path so an administrator can deliberately
exclude an already mapped direct Games child and later map it again, without
changing unrelated mappings.

## Steps

1. Reproduce the reported `POST /setup/folders/assign` response for `wii` in the
   authenticated development browser and record its status and safe error code.
2. Update the recovery transaction so a persisted direct mapping can transition
   to an explicit exclusion. Preserve conflict protection for unsafe mapping
   changes and retain row-local HTTP error feedback in the UI.
3. Inspect the resulting flow in Chromium at 1440 px and 390 px: exclude `wii`,
   reload, map it back, reload, verify `pc` remains Windows, and complete a
   normal quick scan with the catalog visible.
4. Update backend architecture and quick-task state, save browser screenshots
   and the external UAT report, then run only typecheck/compilation and diff
   whitespace checks. No tests are added or run before live acceptance.
