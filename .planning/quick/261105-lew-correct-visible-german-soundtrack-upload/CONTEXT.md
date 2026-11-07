# Quick Task 261105-lew: Correct visible German soundtrack-upload catalog text

**Gathered:** 2026-11-05
**Status:** Ready for execution

<domain>
## Task Boundary

Correct only the German catalogue values rendered by the existing main-game
soundtrack upload surface and confirmed by authenticated visual UAT. The task
is a localisation correction, not a soundtrack feature change.

</domain>

<decisions>
## Locked Decisions

### D-01: Strictly limited localisation scope
- Edit only existing, visible German soundtrack-upload catalogue values in
  `frontend/src/locales/de_DE/rom.json`.
- Do not alter components, composables, API contracts, styles, state handling,
  media behaviour, or unrelated translations.

### D-02: No automated checks for this correction
- Do not add or run tests or test suites.
- Re-open the authenticated UAT soundtrack upload surface in a real headless
  browser after the catalogue edit and confirm the corrected labels/hints are
  visible there.

### D-03: Preserve workflow boundaries
- Do not edit `STATE.md` and do not perform Git staging, commits, branch
  changes, pushes, or merges from this quick task.
- Do not persist, print, screenshot-name, or otherwise expose UAT credentials.

</decisions>

<specifics>
## Confirmed catalogue candidates

The affected existing keys are the visible upload copy in the `rom` namespace:
`soundtrack-owned-hint`, `soundtrack-upload-error`, `soundtrack-upload-hint`,
and `soundtrack-uploaded`. Existing German keys such as `upload-soundtrack`
remain unchanged unless the real UAT rendering establishes that another
soundtrack-upload key is visibly wrong.

</specifics>

<canonical_refs>
## Canonical References

- Main-game productive surface:
  `frontend/src/v2/components/GameDetails/SoundtrackPanel.vue`
- German catalogue:
  `frontend/src/locales/de_DE/rom.json`
- Authenticated UAT credentials (read at browser-script runtime only):
  `/home/d1sk/ki-run/etc/secrets/za-uat-login.env`

</canonical_refs>
