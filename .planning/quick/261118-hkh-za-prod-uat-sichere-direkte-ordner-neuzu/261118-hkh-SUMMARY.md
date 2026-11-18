---
quick_id: 261118-hkh
status: complete
---

# Quick Task 261118-hkh: Safe direct-folder reassignment and scan-error filtering

## Outcome

- Completed-setup direct-folder mappings keep the backend conflict guard and
  guide a changed active platform through the existing explicit exclusion save.
  The guidance states that catalog entries are untouched: an administrator
  cleans up wrongly scanned catalog entries manually, records `Do not scan`,
  reloads the authority, chooses the replacement platform, and starts any
  later scan manually. Neither UI action infers a platform or starts a scan.
- A filtered empty operation-result page repeats a terminal, non-game-specific
  cause and safe next action. A game-specific failure remains a normal result
  row and therefore remains filterable.
- The current frontend was served through a temporary isolated Vite harness
  against the supplied test API. Authenticated desktop and mobile checks both
  changed an existing mapping locally, displayed the `Do not scan first`
  guidance, and confirmed that ordinary Save was disabled. No assignment was
  sent, so no shared test data changed.

## Verification

- `npm run typecheck` passed.
- No test or test suite was started before renewed live UAT.
- `git diff --check` passed before the final documentation update.

## Follow-up

The supplied UAT instance still serves an older backend/frontend combination.
The remaining UAT proof is a disposable, current-stack run of the two POSTs:
after the user manually removes wrong catalog entries, save `Do not scan`,
reload, select and save the replacement platform, then manually start a fresh
scan. Confirm that no old entries were modified automatically. The isolated
desktop harness also observed one aborted optional `/api/setup/status` request
from the shared test API; it is handled as an unknown health indicator and did
not affect the mapping interaction. Repeat this check on the current deployed
stack before treating it as a clean network result.
