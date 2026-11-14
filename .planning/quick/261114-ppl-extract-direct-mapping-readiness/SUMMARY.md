---
quick_id: 261114-ppl
status: complete
---

# Extract direct mapping readiness

## Implementation

Extracted the completed-setup direct-folder readiness lookup into
`directFolderMappingReadiness.ts`. Home and Scan now share the same active
direct-mapping filter rather than duplicating it. `Home.vue` returns to 684
lines, exactly its main baseline, so this branch no longer grows the existing
over-limit view.

## Verification

- `npm run typecheck` completed successfully.
- `Home.vue`: 684 lines on this branch and 684 lines on main.
- `git diff --check` passed.
- No tests or test suites were added or run before UAT.
