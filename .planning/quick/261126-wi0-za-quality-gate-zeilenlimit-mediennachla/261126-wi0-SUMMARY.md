---
status: complete
job_id: 261126-wi0
commits: [b809d51d2, 553824470]
---

# Provider-media follow-up line-limit correction

## Implemented

- `finalize_manual_match` owns post-persistence manual-match work. It retains a
  `ProviderMediaOperationError` until description refresh and the PlayMatch
  suggestion have run, then the endpoint serializes the same stage-specific 409.
- `settleOwnedMediaRefresh` returns the canonical reloaded ROM together with the
  original error after a partially persisted media failure. The metadata dialog
  remains responsible for dialog state and notifications.
- `classicMatch.ts` normalizes classic candidates, including cover selection, and
  keeps unchanged-payload comparison with the matching feature.
- `createClassicMatchPayload` returns a complete `SimpleRom`, preserving the
  `romApi.updateRom` contract while comparison remains limited to the relevant
  classic-match fields.

## Line counts

| Datei | Basis `50902e37b` | Vorher | Nachher |
| --- | ---: | ---: | ---: |
| `backend/endpoints/roms/__init__.py` | 2322 | 2327 | 2307 |
| `MatchRomDialog.vue` | 770 | 785 | 760 |
| `RefreshMetadataDialog.vue` | 879 | 884 | 877 |
| `EditRomDialog.vue` | 534 | 515 | 515 |

`EditRomDialog.vue` remains unchanged. Its remaining legacy size is outside this
correction and is already reduced by the `useEditRomUpdate` boundary.

## Verification

- PASS: `trunk check` for the seven changed production files and corrected
  MatchRom files
- PASS: `npm run typecheck`
- PASS: `git diff --check`
- No tests, browser harnesses, test instances, or builds were started.

## Documentation

No architecture document changed: the route schema, public API contract, and v2
dialog workflow ownership remain unchanged. Concise docstrings and comments
document the new domain boundaries at the responsible code.
