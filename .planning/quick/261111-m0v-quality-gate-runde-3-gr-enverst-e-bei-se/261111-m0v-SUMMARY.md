---
id: 261111-m0v
title: Extract setup exclusions and ZASelect responsibilities below the hard file limit
status: complete
date: 2026-11-11
job_id: 261111-98c5
---

# Quick Task 261111-m0v Summary

The setup exclusion model and ZASelect implementation now have focused runtime
boundaries while preserving the setup exclusion and searchable platform contract.

## Changes

- Moved `SetupFolderExclusion` to `backend/models/setup_folder_exclusion.py`.
  The original table name, constraints, cascade, relationship, and path contract
  remain unchanged. Model package and Alembic imports keep the table registered.
- Split ZASelect item/search, selection, and floating-menu state into typed
  composables. The public `ZASelect` export, props, emits, slots, and exposed
  methods remain on the root component.
- Extracted activator, teleported menu, field styles, and menu styles without
  changing the pinned action or case-insensitive local filtering contract.
- Updated backend and frontend architecture documentation for the new owners.

## Verification

- Measured runtime source sizes: `backend/models/storage.py` is 450 lines;
  `setup_folder_exclusion.py` is 39 lines. ZASelect runtime Vue and TypeScript
  modules range from 56 to 254 lines.
- Ran Python `compileall` for the extracted model, setup handlers, and Alembic
  environment using a temporary bytecode cache.
- Ran `npm run typecheck` successfully.
- Ran `npm run build`; Vite transformed 3,933 modules but the pre-existing PWA
  close-bundle configuration failed because Workbox found neither precache nor
  runtime-cache input. No application source was changed to bypass that gate.
- Ran `git diff --check`. No test or test suite was created, modified, weakened,
  or executed.

## Limitations

- Browser inspection was not performed. The requested disposable setup browser
  environment was not available, and the production build did not complete due
  to the unrelated Workbox configuration failure.
- Human UAT remains responsible for `Nicht scannen`, `win` to Windows, keyboard
  navigation, and the follow-up scan behavior.

## Commits

- `04c2ac519` extracts the setup exclusion model.
- `78b06ed3e` registers the extracted model for metadata loading.
- `d0c0137d8` decomposes ZASelect and updates architecture documentation.
