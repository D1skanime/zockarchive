# Phase 42: Ähnliche Spiele ausserhalb der Bibliothek ein- oder ausblenden - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning
**Mode:** Autonomous, user requirements supplied with the job
**ki-run Job:** `261110-824a`
**Job binding:** `.planning/ki-run/261110-824a.json` binds this phase directory to the active ZA job.

<domain>
## Phase Boundary

Add one persisted, per-user preference in the v2 user-interface settings which controls whether the existing Similar games overview section may include titles outside the active account's accessible ZA library. The enabled default keeps the current external-card behavior. The disabled state renders only positively resolved local matches, retains IGDB provider order, filters before limiting to six cards, and removes both the section and its heading if no local match exists. DLC, expansion, remake, remaster, and other related-content sections are explicitly out of scope.
</domain>

<decisions>
## Implementation Decisions

### Preference and initialization
- Add the boolean to the existing `useUISettings` registry with `true` as its default, so its existing local persistence and user `ui_settings` synchronization remain the sole storage path.
- Reuse `SettingsToggleRow` in Settings → User interface, with localized label and help text. Keep its native button/switch keyboard behavior rather than adding a new control.
- Treat backend settings as authoritative once the active account is known. A missing persisted value means enabled, while an explicitly stored `false` must gate rendering before any external similar-game card can appear.

### Library resolution boundary
- Move the similar-game IGDB-to-local-ROM lookup above individual cards into a focused shared boundary for this one section, and pass confirmed local destinations into the grid/cards.
- Deduplicate IGDB IDs before requesting the existing metadata-provider lookup and reuse successful per-account resolution only within safe cache boundaries. Do not fetch a paginated library or infer ownership from a title.
- Keep pending, confirmed absence, and lookup error distinct. Only confirmed local targets qualify when the preference is disabled; a failed lookup is neither a negative cached result nor proof of non-ownership.

### Rendering and stale responses
- Preserve the metadata-provider ordering after resolution, then apply the six-card limit. A local match after position six must therefore move into the visible subset when external titles are disabled.
- While the disabled view is unresolved, render no external fallback. Discard responses that no longer belong to the active game, account, or preference generation.
- Keep confirmed local cards navigating to the resolved ZA ROM. When enabled, unresolved and absent entries retain the existing IGDB external destination behavior.

### Storybook and delivery evidence
- Use real `SettingsToggleRow` and `RelatedGamesGrid` compositions, not duplicated lookalikes. Supply deterministic provider data for enabled mixed cards, disabled local-only cards, a local match after position seven, resolving, no-match, and lookup-error states.
- The empty example must render the overview context without the Similar games heading. Stories require no live provider.
- Before human UAT, inspect Storybook and the live browser at 1440px and 390px, operate the setting with keyboard as well as pointer, and record routes, story names, screenshots, and limitations in `sichtpruefung.md`. Do not add or run tests before acceptance.

### the agent's Discretion
- Choose the smallest composable/type boundary, cache lifetime, and exact loading affordance that prevent duplicate per-display lookups and stale state while retaining existing API behavior.
- No backend contract change is intended. If code inspection proves one is unavoidable, update the backend architecture document and generated API types in the same phase.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/composables/useUISettings.ts` already persists typed primitive settings locally and synchronizes the complete object with `user.ui_settings`.
- `frontend/src/v2/views/Settings/UserInterface.vue` owns User interface settings and composes `SettingsToggleRow`.
- `frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue` renders related cards; `RelatedGameCard.vue` currently performs a per-card `romApi.getRomByMetadataProvider({ field: "igdb_id" })` lookup.
- `frontend/src/v2/views/GameDetails.vue` still truncates `similar_games` to six before `OverviewTab.vue` renders the Similar games section.

### Established Patterns
- v2 composites use canonical adapters, localized strings, `ZA*` primitives, and native keyboard behavior. Persistent per-user UI preferences belong in `useUISettings`.
- Detail views reuse their instance during route changes, so asynchronous data consumers must guard each response against the currently active route state.
- The metadata-provider lookup is the established ownership proof; the current catalog page and game-name matching are not reliable ownership sources.

### Integration Points
- `GameDetails.vue` owns the IGDB related-game source and must make the full similar list available to the resolver before the section limit.
- `OverviewTab.vue` owns the Similar games heading and section visibility.
- `RelatedGamesGrid.vue` and `RelatedGameCard.vue` must consume central resolution output without independently repeating the same lookup.
- `frontend/src/locales/*/settings.json`, `frontend/src/locales/*/rom.json`, `docs/FRONTEND_ARCHITECTURE.md`, and the v2 Storybook catalogue require aligned updates.
</code_context>

<specifics>
## Specific Ideas

Canonical refs: `frontend/src/composables/useUISettings.ts`, `frontend/src/v2/views/Settings/UserInterface.vue`, `frontend/src/v2/views/GameDetails.vue`, `frontend/src/v2/components/GameDetails/OverviewTab.vue`, `frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue`, `frontend/src/v2/components/GameDetails/RelatedGameCard.vue`, `docs/FRONTEND_ARCHITECTURE.md`, and all locale files under `frontend/src/locales/`.

The job acceptance cases are the source of truth: enabled mixed recommendations retain current behavior, disabled mode admits only resolved local cards including those after the initial six positions, no local result removes the whole section, and stale/failed lookups never expose external cards in disabled mode.
</specifics>

<deferred>
## Deferred Ideas

None, discussion stayed within the approved similar-games preference scope.
</deferred>
