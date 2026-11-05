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
- **D-07:** Correction round 1 found the job migration based on historical revision 0138 while the merged scan chain continues to 0143, creating multiple Alembic heads. Reconnect this unmerged migration after the current head, retain its DDL, correct nullable upload-path handling, and verify only isolated affected backend targets.
- **D-08:** The last remaining MariaDB failure was a test-runner fixture visibility defect: the committed PC library fixture lives at repository-level `tests/fixtures`, while the disposable runner copied and mounted only backend/frontend sources. Preserve the canonical fixture location, copy it into each disposable snapshot, and mount it read-only. Do not weaken the manifest assertion or use durable data.
- **D-09:** Gate round 2 reproduced four Config persistence failures in CI shard 5. A failed YAML serialization or atomic replacement must leave both the on-disk file and the active singleton `Config` identity authoritative. Restore the pre-mutation manager state on persistence exceptions; do not change endpoint responses or weaken the authority assertions.
- **D-10:** Gate round 3 first isolated the DLC-owned filesystem storage surface into its own module. The later gate still reports the response, ORM, and database additions, so their component-only seams must likewise be extracted without duplicate contracts or changed persistence semantics.
- **D-11:** Component-owned placement response contracts, the SQLAlchemy placement model, and component manual/placement mutations each have a single focused module. Existing imports remain stable through deliberate re-exports; targeted MariaDB endpoint/database/model tests prove the same scoped behavior.
- **D-12:** Independent review found that the original job scope still has four visible frontend gaps: main-game artwork cards/actions and soundtrack upload must consume the documented media composites; local soundtrack candidates must be audio-only; DLC gallery needs role-specific empty copy; and missing/common German-visible labels must be localized without weakening catalog or locale guards.
- **D-13:** Second independent review confirmed that the existing background Storybook claims were not rendered by distinct art/fallback states, and that main/DLC carousel close controls still used their hardcoded English fallback. Storybook must expose bright art, dark art, ZA fallback only, and an interactively toggled art-to-fallback crossfade; both media carousels receive the existing localized close label.
- **D-14:** The deterministic line-limit gate finds `PcDlcMediaTab.vue` at 451 lines, one above its 450-line maximum. Reuse the existing vertical `ZATabNav` primitive for the DLC media navigation and add its generally useful optional `aria-controls` item contract, preserving tab ownership and accessibility instead of compressing code or weakening the gate.
- **D-15:** The Wave 11 independent review found that the first `ZATabNav` adoption left non-active DLC tab panels absent, lacked reciprocal tab IDs/labels, and did not support arrow, Home, End, or gamepad navigation. Preserve the line-limit fix while completing the primitive's universal-input tab behavior, stabilizing all panel anchors, and canonicalizing obsolete DLC media subtabs such as `cover`.
- **D-16:** The deterministic gate finds `ZATabNav.vue` at 458 lines after its universal-input behavior was added. Extract the orientation-aware key-to-tab target calculation into a focused, pure helper within the primitive, retain the rendered keyboard/gamepad contract and tests, and do not weaken the 450-line policy.
- **D-17:** Independent review confirms two remaining scope gaps: document the component-owned DLC manual/media API and persistence boundaries in backend architecture documentation, and migrate main-game media navigation to the same vertical `ZATabNav` primitive as DLC. Preserve mounted panels, bookmarkable route state, and reciprocal tab/panel associations while adding rendered navigation coverage.
- **D-18:** Independent review confirms that image-card preview behavior cannot represent DLC soundtrack audio. A dedicated DLC soundtrack composite must render native audio playback controls and a download action for component-owned audio, while retaining component-scoped soundtrack placement and deletion actions. It must never route audio into the image lightbox.
- **D-19:** Quick task `261105-dl5` applies the human's narrowed scope: DLCs have no manual UI entry or parity promise, while existing component-manual data, migration, and compatibility routes remain intact and the main-game manual is unchanged. The same bounded correction makes DLC image filenames collision-resistant and derives dark-art overlay treatment from the active cross-fade layer so stale inactive art cannot tint the ZA-glass fallback.
- **D-20:** Quick task `261105-f1c` replaces copied media Storybook shells with the productive main-game/DLC tabs using synthetic owners, gives each background layer its own synchronized overlay, and keeps main/DLC soundtrack controls on shared action semantics. Component-owned soundtrack ordering is version-checked and cannot cross a DLC boundary.

### the agent's Discretion
Use the existing Storybook-language guard's exact candidate identity as the sole correction mechanism. Record failures and results honestly in the summary and verification.

The new owned-media endpoint and DLC media view may be decomposed only at safe job-added seams. Do not use the correction as a reason to rewrite unrelated legacy monoliths, weaken tests, or change persisted media behavior.

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
