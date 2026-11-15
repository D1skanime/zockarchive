---
quick_id: 261114-phr
status: complete
---

# Avoid exclusion readiness requests

## Implementation

Home now uses the completed-setup direct assignment projection before it checks
storage readiness, matching Scan's active-mapping scope. The generic Folder
Mappings tab now skips current direct paths and direct platform identities
before making legacy per-platform mapping requests. An intentionally excluded
Wii directory therefore remains visible only in Games and cannot issue a
missing-mapping 409 from either surface.

## Verification

- `npm run typecheck` completed successfully.
- Authenticated desktop and 390 px browser checks clicked the Scan library
action and every Library Management tab. Both confirmed one direct Library
Management link, enabled Scan action, pc mapped to Windows, and Wii excluded.
- Final checks observed no post-login console errors or failed network
requests. The prior desktop quick-scan evidence remains completed and the
second scan was completed during this sight check.
- No new tests or test suites were added or run before UAT.
