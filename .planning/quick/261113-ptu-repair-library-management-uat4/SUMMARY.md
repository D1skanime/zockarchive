---
quick_id: 261113-ptu
status: complete
---

# Library Management UAT 4 repair

Games now owns direct-child administration in a two-column Folder and Platform view. Each selector retains its selected platform or `Do not scan`, tracks a changed row until save, and retains a row-local HTTP status/detail error after a failed save. The library root health is read independently, so a transient status failure cannot hide the assignment projection.

The obsolete Storage tab and its URL state have been removed. A legacy `?tab=storage` link now resolves to Games, while generic mappings and backend storage/scan ownership remain unchanged.

## Verification

- `npm run typecheck` passed.
- Locale parity and sorted-key checks passed.
- `git diff --check` passed.
- Browser automation used the normal login form against the refreshed `pgdp-dev`
  service. At 1440 px and 390 px it verified the two-column direct-folder view,
  the reachable library status, searchable platform selector, absence of the
  Storage tab, and legacy `?tab=storage` redirection to Games.
- An intentionally invalid reassignment of the existing `pc-Games` Windows
  mapping returned HTTP 409 with `setup_assignment_conflict`. The row retained
  its pending choice and displayed the specific error. Reload restored the
  persisted Windows assignment.
- The normal Scan button accepted a quick operation with HTTP 202 and completed
  without a post-login browser console or network error. The operation reported
  38 games, 13 checked files, and no changed or incomplete file checks. The
  platform catalogue was then visible at both desktop and mobile widths.

## Evidence limits

The refreshed `pgdp-dev` data contains eight pre-existing active direct folders,
not the isolated synthetic A/B/C fixture set. Its first-to-second Windows
promotion and excluded-C assertion were therefore not repeated in this service;
the earlier isolated browser receipt remains the evidence for that fixture path.
The unavailable-mount state was not forced because doing so would require
changing the configured service mount. No permanent service, reserved UAT stack,
user data, or secrets were touched.

## Self-Check: PASSED

The modified view, component, locale catalogue, and architecture documentation are present in the working tree.
