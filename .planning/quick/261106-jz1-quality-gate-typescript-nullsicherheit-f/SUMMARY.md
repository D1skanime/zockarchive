---
quick_id: 261106-jz1
status: complete
parent_phase: 40
commit: recorded in Git history
---

# Summary: TypeScript null safety for active cover source

`activeOwnedCoverSrc` now returns before accessing candidate data when no ROM is
loaded. The remaining local `rom` is non-null, preserving the active-candidate
hero behavior while satisfying strict TypeScript narrowing.

## Verification

- `npm run typecheck` passed with no output errors.
- No test suite was started before live UAT.
