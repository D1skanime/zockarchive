# PC Save Backups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add private, verifiable ZIP backups of arbitrary PC save folders to game details.

**Architecture:** A dedicated owner-scoped `SaveBackup` aggregate holds archive and restore metadata, while a compact handler performs ZIP inspection, integrity verification and owned-storage lifecycle work. The v2 feature creates ZIPs from browser folder files and manages backups through a thin API service and focused dialogs.

**Tech Stack:** FastAPI, SQLAlchemy/Alembic, Python `zipfile`, Vue 3, TypeScript, Vuetify/v2 primitives, Vitest, pytest.

**Spec:** `docs/superpowers/specs/2026-11-01-pc-save-backups-design.md`

## Global Constraints

- Preserve existing Save/State device synchronization unchanged.
- Never write to the read-only game library or use a Windows path as a server path.
- Enforce ownership, bounded upload/ZIP validation, atomic writes and cleanup.
- Add English and German UI copy through the locale system.
- Keep production files focused and under repository size limits.

## Review Focus

- A crafted ZIP with traversal, duplicate member or symlink metadata must never persist.
- A second user must receive no backup metadata, bytes or delete ability.
- Archive bytes and each manifest checksum must match the uploaded synthetic hierarchy.
- A note failure must not leave a successful-looking incomplete backup.
- Browser folder selection must retain relative paths, including Unicode and spaces.

### Task 1: Persisted Backup Aggregate and Handler

**Files:**

- Create: `backend/models/save_backup.py`
- Create: `backend/handler/database/save_backups_handler.py`
- Create: `backend/alembic/versions/0143_save_backups.py`
- Create: `backend/tests/handler/database/test_save_backups_handler.py`
- Modify: model imports/relationships required by `Rom` and `User`

- [x] Write failing handler tests for owner-scoped listing, independent versions and restore path update.
- [x] Run the focused tests and confirm the aggregate is missing.
- [x] Implement the model, relationship and handler with `@begin_session` methods.
- [x] Add and review the cross-dialect Alembic migration.
- [x] Re-run focused tests.

### Task 2: Archive Validation, Storage Lifecycle and API

**Files:**

- Create: `backend/handler/save_backups.py`
- Create: `backend/endpoints/responses/save_backups.py`
- Create: `backend/endpoints/save_backups.py`
- Create: `backend/tests/endpoints/test_save_backups.py`
- Modify: endpoint router registration and API documentation

- [x] Write failing endpoint/unit tests for a nested Unicode fixture, SHA-256 manifest validation, ownership isolation and malicious ZIP members.
- [x] Run those tests and confirm routes/validator are missing.
- [x] Implement streamed bounded upload, no-extraction ZIP inspection, atomic owned-asset archive lifecycle, generated private note and REST endpoints.
- [x] Re-run focused tests, including byte-for-byte downloaded ZIP verification.

### Task 3: v2 Backup Dialogs and API Client

**Files:**

- Create: `frontend/src/v2/components/GameDetails/SaveBackupDialog.vue`
- Create: `frontend/src/v2/components/GameDetails/SaveRestoreDialog.vue`
- Create: `frontend/src/v2/components/GameDetails/saveBackups.ts`
- Modify: `frontend/src/services/api/save.ts`
- Modify: `frontend/src/v2/components/GameDetails/SaveDataTab.vue`
- Modify: locale files
- Test: focused Vitest source/unit tests

- [x] Write failing tests for ZIP manifest creation and relative-path rejection.
- [x] Run the tests and confirm the composable/module is missing.
- [x] Implement browser folder input, client-side ZIP creation, progress/error states, backup listing/actions and restore instructions using existing v2 dialogs and feedback patterns.
- [x] Add complete German and English copy plus locale parity validation.
- [x] Run frontend focused tests and typecheck.

### Task 4: Documentation and Verification

**Files:**

- Modify: `docs/BACKEND_ARCHITECTURE.md`
- Modify: `docs/FRONTEND_ARCHITECTURE.md`
- Create: `docs/PC_SAVE_BACKUPS.md`

- [x] Document user workflow, restore semantics, environment-variable paths, server persistence, migration, backup/restore, browser limitations and security boundary.
- [x] Run affected pytest/Vitest tests, migration upgrade/downgrade where environment permits, typecheck, i18n checks and Trunk.
- [x] Inspect the final diff and commit with a concise English feature message.
