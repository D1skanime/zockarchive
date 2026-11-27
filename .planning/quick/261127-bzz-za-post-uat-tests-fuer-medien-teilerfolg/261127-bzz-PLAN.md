---
title: Post-UAT direct regression tests for provider-media partial success
wave: 1
depends_on: []
files_modified:
  - backend/tests/endpoints/roms/test_manual_match.py
  - frontend/src/v2/composables/useOwnedMediaRefresh/index.test.ts
  - frontend/src/v2/components/MatchRom/classicMatch.test.ts
autonomous: true
---

## Objective

Add direct, post-UAT regression coverage for the accepted provider-media partial-success behavior. This quick task changes test files only. It must not modify product code, component rendering, browser harnesses, snapshots, or click and pointer simulations.

## Tasks

1. Create `backend/tests/endpoints/roms/test_manual_match.py` as a unit-level async test module for `endpoints.roms.manual_match.finalize_manual_match`. Mock `rm.publish_igdb` to raise `ProviderMediaOperationError("publication", ...)`, mock `refresh_manual_descriptions`, `db_rom_handler.get_rom`, `meta_playmatch_handler.is_manual_match`, `meta_playmatch_handler.submit_manual_match_suggestion`, and `fire_and_forget`. Assert that the function returns the refreshed canonical ROM plus the original media error, invokes description refresh for each eligible `ss_id` and `steam_id` using the captured locale and persisted version, reloads the ROM after each refresh, and queues the PlayMatch suggestion after the refreshes despite the publish error. Assert call order directly from mocks. Also cover the non-eligible provider-field case so it does not refresh descriptions while the suggestion behavior remains defined.

2. Create `frontend/src/v2/composables/useOwnedMediaRefresh/index.test.ts` with direct composable tests only. Mock `romApi.refreshOwnedMedia`, `storeRoms().refreshRom`, and Axios error detection. Verify that `settleOwnedMediaRefresh` returns the API ROM unchanged after a successful refresh, converts only a `409` whose detail starts with `Provider media ` into `provider-media-conflict` after reloading canonical ROM state, returns the original error when the error is not that conflict, and returns the original provider error when canonical reload fails. Assert exact API arguments and that no reload is attempted for non-provider conflicts.

3. Create `frontend/src/v2/components/MatchRom/classicMatch.test.ts` for the pure helpers exported by `classicMatch.ts`. Test `createClassicMatchPayload` directly for provider-ID normalization, clearing manual metadata, preservation of fields intentionally retained from the target, provider-cover fallback order, and `t_cover_big` to `t_1080p` normalization. Test `isUnchangedClassicMatchPayload` directly for an identical complete payload and one changed field from each compared payload category, including provider IDs, display metadata, cover URL, and manual metadata. Do not mount `MatchRomDialog` or simulate UI events.

## Verification

Run only these targeted files after writing them:

```text
cd backend && uv run pytest tests/endpoints/roms/test_manual_match.py -q
cd frontend && npm run test -- src/v2/composables/useOwnedMediaRefresh/index.test.ts src/v2/components/MatchRom/classicMatch.test.ts
```

Do not run complete backend or frontend suites. If a failure requires product-code changes, stop and report the concrete blocker instead of changing production files.

## Completion

The three direct test modules cover the accepted backend continuation, owned-media conflict settlement, and classic-match pure mapping behavior. Only test files and the required quick-task artifacts may be committed.
