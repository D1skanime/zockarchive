---
quick_id: 261118-hkh
status: complete
---

# Quick Task 261118-hkh: Safe direct-folder reassignment and scan-error filtering

## Outcome

- Completed-setup direct-folder mappings now keep the backend conflict guard and
  guide a changed active platform through the existing explicit exclusion save.
  The guidance states that catalog entries are retained, reloads the authority
  after exclusion, and only then permits the replacement platform.
- A filtered empty operation-result page repeats a terminal, non-game-specific
  cause and safe next action. A game-specific failure remains a normal result
  row and therefore remains filterable.
- The direct-mapping and result explorer flows were prepared for authenticated
  desktop and mobile inspection. The provided running instance did not finish
  the fresh normal login before the browser automation deadline, so its UAT
  evidence is intentionally recorded as incomplete rather than asserted.

## Verification

- `npm run typecheck` passed.
- No test or test suite was started before renewed live UAT.
- `git diff --check` passed before the final documentation update.

## Follow-up

Run the authenticated desktop and mobile UAT against a current served build:
change one already assigned direct folder, use the explicit exclusion action,
reload, select its replacement platform, and verify both a non-game terminal
failure and a game-scoped failure with the Failed filter.
