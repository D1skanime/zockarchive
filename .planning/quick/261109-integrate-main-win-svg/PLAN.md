---
quick_id: 261109-integrate-main-win-svg
status: complete
phase: 41
---

# Quick Task: Integrate the updated main platform icon

## Scope

Fetch and merge the user-specified `origin/main` commit
`319720cb8df26bad8a1629f1546b4280704e5d60` into the active Phase 41 job
branch. Preserve all job commits, including `a04560381` and `26c2a68ca`, leave
the local `main` branch untouched, and make no edit to `win.svg`.

## Steps

1. Verify the fetched commit ancestry and its one-file upstream diff.
2. Merge the exact commit into `ki/za-261107-8ee7`, inspect the merge tree and
   confirm the protected scan correction commits remain ancestors.
3. Use the existing local ZA browser path at desktop and mobile widths to
   inspect the scan explorer and attempt the action-required provider-warning
   flow without mutating the existing library.
4. Record actual browser evidence, update state, and commit the integration
   artifacts. No tests or test suites run before live UAT.
