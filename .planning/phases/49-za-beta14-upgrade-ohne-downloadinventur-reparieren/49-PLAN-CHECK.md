# Phase 49 Plan Check

## BLOCKER

1. **Nyquist validation gate is missing.** `workflow.nyquist_validation` is enabled and `49-RESEARCH.md` contains a `Validation Architecture` section, but the phase directory has no `49-VALIDATION.md`. The plans may deliberately prohibit repository tests and browser automation before human UAT, but the required validation artifact must still record the permitted temporary-fixture, static-inspection, typecheck, scoped-lint, build, and human-UAT evidence. Add `49-VALIDATION.md` before execution.

2. **The security-critical mapping-revision seam is unresolved.** `49-RESEARCH.md` has an unresolved `## Open Questions` section. In particular, it does not identify the exact endpoint-safe active-mapping lookup API, while Plan 49-02 Task 2 only says to "resolve the owning active mapping". That leaves the request-time preparation path ambiguous and risks falling back to a global or scan-scoped handler, defeating the required `MappingReadContext` ID/version binding. Resolve the exact handler/API and its stale/unavailable failure contract in research, then name that concrete API and call sequence in Task 2.

3. **The authoritative phase goal and requirements are absent from the roadmap.** `ROADMAP.md` still states `Goal: [To be planned]` and `Requirements: TBD`, while all plans claim the synthetic requirement `PHASE-49`. The context establishes useful decisions, but it does not replace a roadmap goal and stable requirement mapping for coverage verification. Record the Phase 49 goal and requirement IDs in `ROADMAP.md`, then map each ID to the relevant plan task.

No PASS: execution must wait for these blockers to be resolved.
