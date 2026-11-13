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
- Browser automation used the normal login form, but the running service did not complete the post-login settings navigation within the tool timeout. No screenshot or scan claim is made from that attempt.

## Evidence limits

The requested isolated A/B/C scan and deliberate unavailable-mount proof remain unverified in this execution because the running service navigation timed out. No permanent service, reserved UAT stack, user data, or secrets were touched.

## Self-Check: PASSED

The modified view, component, locale catalogue, and architecture documentation are present in the working tree.
