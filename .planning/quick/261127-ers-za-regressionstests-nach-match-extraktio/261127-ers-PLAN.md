---
title: Repair regression tests after manual-match extraction
wave: 1
depends_on: []
files_modified:
  - frontend/src/v2/components/Dialogs/MatchRomDialog.test.ts
  - backend/tests/endpoints/test_storage_policy_denials.py
autonomous: true
---

## Objective

Repair the two regression tests made stale by the intentional manual-match extraction. Preserve their behavioral contracts, without changing production code or weakening assertions.

## Tasks

1. **Align the classic-match operation-parity guard with the extracted payload contract.**
   - **Files:** `frontend/src/v2/components/Dialogs/MatchRomDialog.test.ts`.
   - **Action:** Replace the source assertion for the removed inline `updatedRom` object literal with assertions that `handleClassicMatch` delegates payload construction to `createClassicMatchPayload` using the selected candidate and current target ROM. Keep the guard that the dialog closes only after the update path succeeds, and retains classic-match context in its error path. Do not convert this into a looser render, snapshot, or click test.
   - **Verify:** `cd frontend && npm run test -- src/v2/components/Dialogs/MatchRomDialog.test.ts`
   - **Done:** The direct operation guard verifies the extracted helper seam and the same success-before-close behavior, without depending on deleted inline implementation details.

2. **Patch the manual-match seam at its extracted module.**
   - **Files:** `backend/tests/endpoints/test_storage_policy_denials.py`.
   - **Action:** Change only the PlayMatch monkeypatch in `test_update_rom_same_fs_name_keeps_metadata_and_owned_resources` to target `endpoints.roms.manual_match.meta_playmatch_handler`, where the extracted finalization helper now imports and invokes it. Preserve the existing assertion intent and all other endpoint setup. Do not alter application imports, endpoint code, fixtures, or expected behavior.
   - **Verify:** `cd backend && uv run pytest tests/endpoints/test_storage_policy_denials.py::test_update_rom_same_fs_name_keeps_metadata_and_owned_resources -q`
   - **Done:** The focused endpoint test patches the actual runtime lookup seam and passes against the extracted manual-match implementation.

## Verification

Run only the two targeted test commands above, followed by the repository's scoped lint command for the two edited test files and `git diff --check`. Do not run a complete suite, add tests, or modify production files.

## Completion

Both failures introduced by the extraction are corrected through precise test-seam updates. The commit contains only the two test files and this quick-task artifact.
