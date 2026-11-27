---
status: complete
job_id: 261126-243a
commit: 27dcd2ddd
---

# Regression test repair after manual-match extraction

## Completed work

- Updated the classic-match operation guard to verify the extracted
  `createClassicMatchPayload(targetRom, payload.matchedRom, payload.cover)`
  contract while retaining the success-before-close and error-context guards.
- Redirected the storage-policy endpoint test's PlayMatch monkeypatch to the
  extracted `endpoints.roms.manual_match` runtime seam.
- Changed only test files. No product code or behavioral test case was removed.

## Verification

- `npm run test -- src/v2/components/Dialogs/MatchRomDialog.test.ts`: passed,
  22 tests.
- `python3 backend/tools/phase34.py backend --dialect mariadb --timeout 900 tests/endpoints/test_storage_policy_denials.py::test_update_rom_same_fs_name_keeps_metadata_and_owned_resources`: passed.
- `trunk check frontend/src/v2/components/Dialogs/MatchRomDialog.test.ts backend/tests/endpoints/test_storage_policy_denials.py`: passed.
- `git diff --check`: passed.

## Commit

- `27dcd2ddd test: Extraktions-Seams im Matching korrigieren`
