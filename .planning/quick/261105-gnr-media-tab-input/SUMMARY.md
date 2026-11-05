---
quick_id: 261105-gnr
status: complete
completed: 2026-11-05
parent_phase: 40
---

# Restore detail navigation after entering media Summary

The main-game and DLC detail shells now isolate their scrolling media panel
from the primary navigation stacking level. Sticky upload headers remain
usable in the panel but cannot cover primary tab hit targets.

The main media Playwright helper now selects the productive shared vertical
`ZATabNav`, and a browser regression covers Media to Overview. Rendered DLC
coverage proves Media can mount and the user can return to Overview.

## Verification

- Focused Vitest: 26 passed in `PcDlcDetail.test.ts` and `MediaTab.test.ts`.
- `npm run typecheck` passed.
- `python3 "$KI_HOME/bin/ki-targeted-tests" frontend` passed: 157 tests in
  18 files.
- Scoped `trunk fmt` and `trunk check` passed for the four changed frontend
  files, and `git diff --check` passed.

The local frontend server has no backend listener, so the newly added
browser-path test was not run against live fixture data in this checkout.
That remains the next human live-UAT confirmation, not a claim of a completed
full browser suite.
