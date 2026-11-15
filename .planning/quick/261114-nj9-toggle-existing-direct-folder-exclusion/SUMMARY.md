---
quick_id: 261114-nj9
status: complete
---

# Toggle existing direct-folder exclusion

## Outcome

`POST /setup/folders/assign` previously returned HTTP 409 with
`setup_assignment_conflict` whenever an already active direct mapping changed,
including an explicit change to `excluded`. The recovery transaction now
deactivates that direct mapping with its current revision before the existing
assignment handler persists the mutually exclusive exclusion. A later explicit
platform choice creates the new mapping as before. Direct platform-to-platform
changes remain conflicts.

The Games picker now renders `Nicht scannen` for a saved null selection instead
of the ambiguous `Plattform` placeholder.

## Browser evidence

Authenticated Chromium checks at 1440 px and 390 px created a `wii` mapping,
saved `Nicht scannen`, reloaded, reselected Wii and reloaded. `pc` remained
Windows throughout. The normal UI quick scan returned HTTP 202 and its
operation reached `completed` with 27 result rows. Screenshots and the compact
external report are stored with the job evidence.

The application logs a transient unauthenticated current-user request before
the login form completes. No failed request occurred after authentication in
the checked mapping or scan flows.

## Verification

- `PYTHONPYCACHEPREFIX=<temporary> python3 -m py_compile backend/handler/setup_recovery.py`
- `frontend/npm run typecheck`
- `git diff --check`

No tests were added or run before live acceptance.
