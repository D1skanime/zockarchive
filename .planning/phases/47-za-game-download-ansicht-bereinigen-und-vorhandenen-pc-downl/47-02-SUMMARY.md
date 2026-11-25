---
phase: 47-za-game-download-ansicht-bereinigen-und-vorhandenen-pc-downl
plan: 02
status: complete
wave: 2
---

# Plan 47-02 Summary

## Outcome

The detailed ROM API now exposes a server-owned folder-download capability,
and the existing immutable manifest endpoint can create a whole-folder
manifest without receiving thousands of member IDs from the browser.

## Implementation

- Added `folder_download` to the detailed ROM response. It exposes only an
  eligible persisted group's member count and aggregate byte size. It does not
  disclose source paths or member rows.
- Excluded the neutral `folder` component from the existing PC component
  projection, so a folder with thousands of members cannot inflate the detail
  response or acquire PC metadata/media semantics.
- Added the mutually exclusive `whole_folder: true` manifest request mode.
  The database handler locks the requested ROM, its sole persisted neutral
  folder group, and all of its members, then reuses the normal immutable
  evidence capture and member delivery flow.
- Missing, stale, absent, duplicate, or otherwise unavailable folder inventory
  yields the bounded `manifest_folder_inventory_unavailable` response code.
  Existing component, archive-set, and selected-member modes are unchanged.

## Verification

- `npm run typecheck` completed successfully in `frontend/`.
- `git diff --check` completed successfully.
- Targeted Python syntax compilation completed with bytecode redirected to
  `/tmp`, because the repository source tree is not writable for `__pycache__`.
- `uv run ruff check ...` could not run because the local `uv` environment has
  no `ruff` executable.
- Generated OpenAPI types were not changed: no local backend was listening on
  `127.0.0.1:3344`, so `npm run generate` had no schema source. Generated files
  were not hand-edited.
- No tests, Docker resources, or browser/UAT harnesses were run or created.

## Follow-up

Plan 47-03 can consume the generated capability after the normal schema
generation step is available. Plan 47-04 owns the related architecture
documentation updates.
