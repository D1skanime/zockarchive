---
phase: 51
slug: za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-11-26
---

# Phase 51 Validation Strategy

This phase deliberately uses no new repository test or test-suite execution before live UAT. Nyquist coverage is supplied by the explicitly permitted, disposable runtime harness plus the required static and build gates. The commands below completed on the canonical checkout without test execution.

## Allowed pre-UAT evidence

Run only from the canonical Linux checkout on `ki/za-261126-d0af`. The harness lives under `/tmp/za-phase51-media-runtime-harness/`, remains untracked, uses synthetic fixtures and sanitized receipts, and must not read production credentials, inspect or mount a NAS, start Docker stacks, use browser automation, or contact live provider services.

| Validation item | Plan task | Command or evidence | Required observation | Status |
|---|---|---|---|---|
| Legacy and handler lifecycle | Isolated harness | `before.json` and `after-handler.json` | Synthetic legacy same-ID and partial-catalog behavior was reproduced. The handler receipt records a live catalog, active-path reuse, additive publication, suppression, retry, empty-catalog no-retirement, manual-state preservation, and no source write. | Passed |
| Protected endpoint outcomes | Isolated harness | `same-id-endpoint.json` and `endpoint-outcomes.json` | Same-ID refresh and lookup, download, storage, publication, partial, and success outcomes returned the expected canonical response or stage-specific 409 detail. | Passed |
| v2 request settlement | Isolated source contract | `refresh-dialog-contract.json` | The existing request is awaited, rejection remains retryable, and no second client flow exists. | Passed |
| Final isolated receipt | 51-04 Task 1 | `cd backend && uv run python /tmp/za-phase51-media-runtime-harness/reproduce.py --cases same-id,partial-catalog,reuse,suppression,restart,empty-catalog,retry,permission,network,storage,publication-conflict --record /tmp/za-phase51-media-runtime-harness/final.json` | `final.json` records synthetic fixture-only execution, no external access, current catalog persistence, additive reuse, normalized alias suppression after restart, empty-catalog no-retirement, manual-state preservation, retry, and lookup, network, storage, and publication outcomes. | Passed |
| Repository format and static checks | 51-04 Task 1 | `trunk fmt && trunk check` | Exit zero. No new issues, four pre-existing issues reported. | Passed |
| Frontend type check | 51-04 Task 1 | `cd frontend && npm run typecheck` | Exit zero. | Passed |
| Frontend production build | 51-04 Task 1 | `cd frontend && npm run build` | Exit zero. Existing CSS, dependency-eval, and chunk-size warnings remained warnings. | Passed |

## Explicit pre-UAT exclusions

- Do not create, modify, run, or discover repository tests or test suites, including `pytest`, `Vitest`, `npm run test`, or backend/frontend test scripts.
- Do not use browser automation, production databases, production provider credentials, real NAS mounts, deployment actions, Docker stacks, or Team4s changes.
- Do not treat a returned ROM as proof that provider media imported. The isolated receipt must distinguish lookup, candidate preparation, download, owned-storage, catalog-publication, and response outcomes.

## Decision-specific validation

- A fully successful eligible reconciliation returns the existing detailed-ROM response. Any lookup/preparation failure or per-item failure uses the existing HTTP 409 detail convention, without a response-schema or generated-client change.
- After a confirmed provider lookup with an empty media array, the normalized empty snapshot replaces the prior provider snapshot but causes no retirement, deletion, suppression, placement, cover, or manual-upload mutation. A lookup failure retains the old snapshot without presenting it as current.

## Live UAT handoff

The isolated evidence and three technical gates have passed. Live UAT verifies the following administrator-visible cases:

1. Reassign a ROM to its current IGDB ID and confirm that the current provider media is considered.
2. Add a new provider item upstream, refresh media, and confirm that it appears without replacing existing manual media.
3. Delete one provider image, refresh after a URL-size alias is returned, and confirm that the deleted image remains absent while unrelated candidates can appear.
4. Confirm that a manually uploaded image, its placement, and the selected cover remain unchanged.
5. Cause or observe one recoverable media failure, retry the same refresh, and confirm that the dialog remains retryable and reports the settled result.
6. Confirm that lookup, download, storage, or publication failures show truthful feedback rather than a success message.

Do not use UAT to restore deleted provider media, inspect source-library paths, or access production storage. Direct logic tests remain intentionally deferred until after acceptance.
