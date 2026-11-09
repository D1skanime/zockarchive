---
quick_id: 261109-ebs
status: complete
phase: 41
wave: 1
depends_on: []
files:
  - backend/endpoints/sockets/scan.py
  - backend/tests/endpoints/sockets/test_scan_job_identity.py
  - frontend/src/v2/components/Scan/InventoryStatusSummary.test.ts
  - frontend/src/v2/components/Scan/OperationStatusPanelFocus.test.ts
  - frontend/src/v2/views/Scan.test.ts
  - frontend/src/v2/views/ScanCollection.test.ts
  - frontend/src/v2/config/project-locales.baseline.json
---

# Repair post-acceptance scan regression failures

## Task 1: Restore the stable socket scan facade

Re-export public scan symbols that callers historically import from
`endpoints.sockets.scan`. Update the focused job-identity test to patch the
runtime owner after the focused-module extraction. Verify the affected backend
tests with MariaDB's prescribed targeted path.

## Task 2: Align component tests with the bounded results architecture

Keep the paginated result explorer as the sole item-list owner. Move obsolete
summary-list expectations to the dedicated detail component or stub the
explorer where a status-panel test only verifies status behavior. Update scan
view and collection integration tests to use their extracted view content
contract. Preserve assertions for status actions, permissions, selection and
filesystem scan requests.

## Task 3: Accept localized scan copy deliberately

Update only the locale digest fixture for the accepted scan namespace changes,
then run locale parity checks and the complete affected frontend test set.

## Verification

Run frontend typecheck, relevant Vitest files, locale checks, targeted backend
tests, and scoped Trunk formatting/checks. Product code is changed only for
the socket facade compatibility contract, which requires renewed live UAT.
