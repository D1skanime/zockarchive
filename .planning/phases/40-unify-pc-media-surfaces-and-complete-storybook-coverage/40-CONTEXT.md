# Phase 40: Unify PC media surfaces and complete Storybook coverage - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning
**Job:** 261103-4b37

<domain>
## Phase Boundary

This phase closes the reproducible Storybook catalog gap on the existing job branch and verifies the already committed PC game/DLC media unification. It does not reimplement completed media behavior, mutate real game data, change backend contracts, deploy, merge, or push.

</domain>

<decisions>
## Implementation Decisions

### Preserved product decisions
- **D-01:** DLC media follows the established main PC-game media navigation and reuses shared upload, card, and action composites.
- **D-02:** The overview action uses a clear existing layout symbol instead of a crown. Shared compositions are documented in Storybook with German visible copy.
- **D-03:** Dark-theme game artwork gains a scoped active-game-art treatment only. ZA glass fallback, login/pairing, light theme, crossfade behavior, and reduced motion remain protected.
- **D-04:** Existing uploaded/provider media, media IDs, placement ownership, permissions, and source-library immutability remain authoritative.

### Current gap and verification policy
- **D-05:** The only executable code gap found after inventory is a stale source-location pair in the Storybook language ledger for `ZATextField` visible story data. Correct the ledger, never weaken the catalog guard.
- **D-06:** Verification is targeted before live UAT: Storybook catalog/build/play coverage, affected media and background tests, frontend typecheck, and the prescribed `ki-targeted-tests frontend`. No full regression runs before human UAT.

### the agent's Discretion
Use the existing Storybook-language guard's exact candidate identity as the sole correction mechanism. Record failures and results honestly in the summary and verification.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Job and implementation constraints
- `CLAUDE.md` - active v2, testing, documentation, component, and source-immutability rules.
- `AGENTS.md` - canonical checkout, ki-run, GSD, branch, and live-UAT controls.
- `docs/superpowers/plans/2026-11-03-pc-media-unification.md` - historical input only, not an execution-plan substitute.

### Storybook and frontend contracts
- `docs/FRONTEND_ARCHITECTURE.md` - Storybook catalog and explicit language-ledger contract.
- `frontend/scripts/check-storybook-catalog.ts` - catalog gate using the language-ledger guard.
- `frontend/scripts/storybookLanguageGuard.ts` - exact candidate identity and stale/duplicate rejection contract.
- `frontend/scripts/storybook-language-decisions.json` - reviewed visible-copy ledger being corrected.
- `frontend/src/v2/components/GameDetails/MediaManagement.stories.ts` - productive media composite stories.
- `frontend/src/v2/components/AppShell/BackgroundArt.stories.ts` - productive dark-art/fallback stories.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MediaUploadControl`, `MediaManagementCard`, and `MediaManagementAction` are productive GameDetails composites with focused tests and stories.
- `check-storybook-catalog.ts` inventories every static visible text candidate; the JSON ledger keys decisions by file, category, text, and source line.

### Established Patterns
- v2 components use existing ZA primitives and Storybook composition inventory declarations.
- Storybook copy is German and requires exact reviewed ledger entries; stale or duplicate entries fail the catalog.

### Integration Points
- `MediaTab.vue` and `PcDlcMediaTab.vue` consume the shared media composites without a new API surface.
- `BackgroundArt.vue` and global tokens retain a scoped dark active-game-art path while the fallback remains independently covered.

</code_context>

<specifics>
## Specific Ideas

Live UAT will inspect `/rom/24?tab=media` and `/rom/24/dlc/20?tab=media` after technical verification. This phase uses only synthetic/mocked frontend tests and Storybook fixtures.

</specifics>

<deferred>
## Deferred Ideas

None. Human browser UAT and the full regression remain deliberately after this technical handoff.

</deferred>

---

*Phase: 40-unify-pc-media-surfaces-and-complete-storybook-coverage*
*Context gathered: 2026-11-04*
