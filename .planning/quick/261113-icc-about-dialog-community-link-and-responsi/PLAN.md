---
quick_id: 261113-icc
title: Repair About dialog community attribution and responsive brand layout
status: in_progress
parent_phase: 44
---

# Plan

1. In `frontend/src/v2/components/Dialogs/AboutDialog.vue`, remove the About-dialog Community tile because no verified official ZockArchive community URL exists in the project. Preserve the existing ZockArchive release, source, and documentation links and the intended upstream attribution in the dialog and branding surfaces; do not redirect the product Community label to RomM's Discord.
2. In `frontend/src/v2/components/shared/ProjectBrand.vue`, constrain the `about` wordmark to its About-tile icon slot so the 148-pixel intrinsic presentation cannot cover the version or documentation tiles at any breakpoint. Retain the navigation and authentication brand variants unchanged, use the existing breakpoint mechanism, and do not introduce raw layout media queries or new user-visible copy. The existing branding contract already documents the community-account boundary, so no product documentation wording needs revision.
3. Inspect the changed dialog in the running authenticated application at 1440 px and 390 px with Playwright: open User menu then About, click each remaining release, source-code, and documentation tile and verify its intended external destination, exercise dialog close/reopen, confirm no Community tile or RomM Discord target remains, and record screenshots plus console and failed-request observations. Run `git diff --check`, write the exact browser evidence and scope rationale in `SUMMARY.md`, update `.planning/STATE.md`'s Quick Tasks Completed table, and commit only the completed quick-task implementation and artifacts. Do not create tests or run a test suite.
