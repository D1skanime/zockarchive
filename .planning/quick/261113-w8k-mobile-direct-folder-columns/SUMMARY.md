---
quick_id: 261113-w8k
status: complete
---

# Preserve direct-folder columns on narrow screens

The narrow Games view retains the Folder and Platform header and uses fluid
one-third/two-thirds grid tracks instead of stacking every row. Pending and
error text stays associated with the Platform column.

## Verification

- Authenticated Playwright browser inspection passed at 1440 px and 390 px.
- Both widths show `Ordnername` and `Plattform`, preserve paired row values,
  and expose the searchable Windows option.
- No post-login browser console or failed network request occurred.
- No test suite was started, per the pre-UAT instruction.

## Self-Check: PASSED

The responsive rule changes only the direct-folder display, leaving its saved
assignment and scan behavior untouched.
