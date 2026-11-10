# Phase 42: Ähnliche Spiele ausserhalb der Bibliothek ein- oder ausblenden - Research

**Researched:** 2026-11-10
**Domain:** Vue 3 v2 detail-view state, per-user UI preferences, related-game ownership resolution, Storybook composition
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

None, discussion stayed within the approved similar-games preference scope.

<phase_requirements>
## Phase Requirements

| ID | Description | Research support |
| --- | --- | --- |
| ZA-RELATED-42-01 | Persisted per-user default-enabled preference controls outside-library recommendations. | Extend the typed `UI_SETTINGS_KEYS` registry, restore from the active account before rendering, and bind the existing settings row. [VERIFIED: codebase grep] |
| ZA-RELATED-42-02 | Disabled view keeps confirmed locals in provider order, filters before six, and hides an empty section. | Resolve the full `igdb_metadata.similar_games` source centrally, derive the ordered visible list, then mount the overview section only for a non-empty result. [VERIFIED: codebase grep] |
| ZA-RELATED-42-03 | Deduplicated bounded lookup and shared targets. | A resolver composable can deduplicate IGDB IDs and call the existing one-ID metadata endpoint, while cards receive its result rather than mounting lookups themselves. [VERIFIED: codebase grep] |
| ZA-RELATED-42-04 | Distinct pending, absence, error, and stale-response safety. | Capture a monotonically advancing game/account/preference generation before asynchronous work and accept results only when it remains current. [VERIFIED: codebase grep] |
| ZA-RELATED-42-05 | Localized strings and deterministic real-component stories. | Locale namespaces, Storybook preview, composition inventory, and language-decision ledger are existing extension points. [VERIFIED: codebase grep] |
| ZA-RELATED-42-06 | Architecture documentation and desktop/mobile browser plus Storybook evidence. | Update the frontend architecture data-flow section and record prescribed visual evidence only after implementation. [VERIFIED: codebase grep] |
</phase_requirements>

## Summary

The implementation can stay entirely in the frontend. The existing `GET /roms/by-metadata-provider?igdb_id=` endpoint already verifies the caller can see a matching ROM through `assert_rom_visible`, returns a `DetailedRomSchema`, and needs no contract change. [VERIFIED: codebase grep] The current implementation is unsafe for the required disabled mode because `GameDetails.vue` truncates the provider list before it reaches `OverviewTab.vue`, and every non-DLC `RelatedGameCard` independently starts its own lookup during `onMounted`. [VERIFIED: codebase grep]

The smallest responsible boundary is a new v2 composable for the Similar games section, with a typed resolved-entry result consumed by `GameDetails.vue`, `OverviewTab.vue`, `RelatedGamesGrid.vue`, and `RelatedGameCard.vue`. It must own resolution state and generation checks, while cards remain presentation and navigation components. Existing remake, remaster, DLC, and expansion behavior must retain the current card-owned lookup path because they are explicitly out of scope. [VERIFIED: codebase grep]

**Primary recommendation:** Add an account-aware `useSimilarGameLibraryResolution` composable, resolve the complete ordered similar-game list there, derive visible entries before applying `slice(0, 6)`, and make the Similar-games grid consume supplied destinations without initiating per-card lookup. [VERIFIED: codebase grep]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
| --- | --- | --- | --- |
| Per-user preference persistence | Browser / Client | API / Backend | `useUISettings` serializes the complete preference object through the existing user update API. [VERIFIED: codebase grep] |
| Ownership proof for one IGDB ID | API / Backend | Browser / Client | The protected endpoint finds a ROM by metadata ID and applies `assert_rom_visible`; the client must not infer ownership from catalog data. [VERIFIED: codebase grep] |
| Deduplication, cache scope, stale-response rejection, and view derivation | Browser / Client | API / Backend | The frontend owns the ordered provider list and reactive route/account/preference context, while each proof comes from the existing API. [VERIFIED: codebase grep] |
| Similar-games section mount and navigation | Browser / Client | Browser / Client | `OverviewTab` owns the heading mount and `RelatedGameCard` owns internal versus external navigation. [VERIFIED: codebase grep] |
| Locale parity and Storybook examples | Browser / Client | Static tooling | Locale JSON, Storybook story modules, inventory, and language ledger are repository-owned frontend artifacts. [VERIFIED: codebase grep] |

## Project Constraints (from AGENTS.md and CLAUDE.md)

- Work only in the canonical Linux checkout and preserve unrelated worktree changes. [VERIFIED: repository instructions]
- v2 is the active frontend. New frontend work belongs under `frontend/src/v2/`; reuse ZA primitives, semantic token variables, and localized strings. [VERIFIED: repository instructions]
- Do not add hex literals, a parallel control, a new persistence system, or a third-party package. [VERIFIED: repository instructions]
- Keep production Vue and TypeScript files below the repository size policy, extracting a focused composable rather than enlarging the already broad detail view. [VERIFIED: repository instructions]
- Update architecture documentation in the same phase as a data-flow or shared-component responsibility change. [VERIFIED: repository instructions]
- Before human UAT, do not add tests and do not run any test suite. The phase's technical evidence is typecheck, build, Storybook catalog/rendering, and manual desktop/mobile browser inspection. [VERIFIED: job instructions]

## Standard Stack

| Existing element | Purpose in this phase | Required use |
| --- | --- | --- |
| Vue 3 Composition API | Reactive resolver state and derived visible entries. | Use `computed`, `watch`, `ref` or `shallowRef`, and cleanup/generation guards in a focused composable. [VERIFIED: codebase grep] |
| `useUISettings` | Typed local persistence and synchronization of `user.ui_settings`. | Add only `showSimilarGamesOutsideLibrary` to its existing registry. [VERIFIED: codebase grep] |
| Existing `romApi.getRomByMetadataProvider` | Accessible-library proof for one IGDB ID. | Reuse it with `{ field: "igdb_id", id }`; do not create an endpoint or load library pages. [VERIFIED: codebase grep] |
| `SettingsToggleRow` | Existing accessible whole-row `button[role="switch"]`. | Bind it with `v-model` in `UserInterface.vue`; do not wrap or duplicate its interaction model. [VERIFIED: codebase grep] |
| `RelatedGamesGrid` and `RelatedGameCard` | Existing real grid/card visual and navigation composition. | Extend their data contract for supplied Similar-games results while preserving existing non-Similar callers. [VERIFIED: codebase grep] |
| vue-i18n locale JSON | User-visible setting and heading strings. | Add keys to every `settings.json` and `rom.json`, then retain parity and sorted-key conventions. [VERIFIED: codebase grep] |
| Existing Storybook configuration | Deterministic component demonstration. | Use Vue stories under `src/v2`, the preview providers, `compositionParameters`, inventory, and language-decision ledger. [VERIFIED: codebase grep] |

No package installation is required. [VERIFIED: codebase grep]

## Existing Implementation Findings

### 1. Preference initialization is the decisive safety issue

`useUISettings` creates one singleton set of `useLocalStorage` refs. Its `initialize()` function copies only keys that are present in `user.ui_settings`; a missing key is left at its current browser-local value. It also returns immediately when the user or `ui_settings` is missing. [VERIFIED: codebase grep] Therefore merely adding a default `true` to the registry is insufficient: an explicit `false` left by account A can survive into account B when B has no stored key, and it can survive a user transition until a new backend payload is applied. [VERIFIED: codebase grep]

The plan must make active-account initialization authoritative for this one setting before Similar games are rendered. Capture the account identity alongside the backend setting object. For an active account, set the value to the explicit boolean when present and otherwise to `true`, rather than retaining a previous account's local-storage value. Keep the existing asynchronous save identity/sequence guard, which already rejects an update response for a changed account or superseded save. [VERIFIED: codebase grep]

The consumer must distinguish `account not yet known` from `active account has an absent key`. Until the first authoritative active-account initialization is complete, disabled rendering must be fail-closed with no external cards. Once resolved, an absent stored key means enabled. This can be exposed as a small readiness ref from `useUISettings` or a resolver input derived there, without adding another storage system. [VERIFIED: codebase grep]

### 2. Current related-game data flow loses required candidates

`GameDetails.vue` computes `similarGames` by slicing `igdb_metadata.similar_games` to six and passes it to `OverviewTab`. `OverviewTab` uses `similarGames.length` both in its related-group predicate and to mount the literal `Similar games` heading plus `RelatedGamesGrid`. [VERIFIED: codebase grep] The full source list must instead cross the `GameDetails` to resolver boundary. Only the resolver's visible list may apply the six-card cap, after filtering in disabled mode. [VERIFIED: codebase grep]

`RelatedGamesGrid` currently maps optional local DLC candidates and otherwise passes raw `IGDBRelatedGame` values to each card. `RelatedGameCard` calls the metadata-provider API for every non-DLC card after mounting, then routes to `/rom/:id` when it gets a match or opens IGDB otherwise. [VERIFIED: codebase grep] Similar games must receive a supplied `localRomId` and resolution status plus an explicit no-card-lookup mode. Non-Similar uses must preserve their present default behavior, avoiding an accidental scope expansion into remakes, remasters, DLCs, or expansions. [VERIFIED: codebase grep]

### 3. The current endpoint is sufficient and authorization-aware

The frontend API wrapper sends one `GET /roms/by-metadata-provider/` request with the metadata field as a query parameter. The backend route requires ROM read scope unless download endpoint authentication is disabled, returns 400 for no metadata ID and 404 for no matching ROM, then calls `assert_rom_visible` before responding. [VERIFIED: codebase grep] This makes a successful response the correct local-accessible target proof, and means no backend schema, generated-type, or backend-architecture change is indicated. [VERIFIED: codebase grep]

Treat a successful response as `local` with the returned ROM ID. Treat only the endpoint's confirmed no-match outcome as `absent`; retain request or authorization/server failures as `error`, not absence. The resolver must never persist error results in its cache. [VERIFIED: codebase grep]

### 4. Existing stale-result precedent

`useMetadataMatchLanguage` is a minimal precedent: it increments a generation in `begin()` or `reset()`, returns immutable captures, and accepts results only when the capture remains current. `useUISettings` likewise uses user identity and a save sequence to reject obsolete profile responses. [VERIFIED: codebase grep] Use the same principle for related games, but include game ID, active account ID, and preference readiness/value in the capture.

## Recommended Architecture Patterns

### Data flow

```text
active user + user.ui_settings
          |
          v
useUISettings authoritative initialization
          |
          +--> showSimilarGamesOutsideLibrary + readiness
                                          |
IGDB full ordered similar_games --> useSimilarGameLibraryResolution
                                          |
                         deduplicated IGDB IDs
                                          |
                                          v
             existing GET /roms/by-metadata-provider?igdb_id=<id>
                                          |
                         local | absent | error result map
                                          |
                                          v
        derive visible entries (preference filter, then limit six)
                                          |
                                          v
 OverviewTab conditionally mounts heading + RelatedGamesGrid
                                          |
                                          v
 RelatedGameCard uses supplied local target or enabled external fallback
```

### Resolver contract

Create a focused composable such as `frontend/src/v2/composables/useSimilarGameLibraryResolution.ts`, staying below the repository's file-size limit. Its input should be reactive full `IGDBRelatedGame[]`, active account ID, preference value, and preference readiness. Its output should contain ordered entries with an explicit discriminated state:

```ts
type SimilarGameResolution =
  | { status: "pending" }
  | { status: "local"; romId: number }
  | { status: "absent" }
  | { status: "error" };

type ResolvedSimilarGame = {
  game: IGDBRelatedGame;
  resolution: SimilarGameResolution;
};
```

This is a recommended local type boundary, not a backend contract. [VERIFIED: codebase grep]

On each relevant input change, create a capture `{ generation, gameId, accountId, preference, ready }`, clear the rendered result to safe pending values, deduplicate only valid IGDB IDs, and schedule at most one endpoint call per unique ID. Resolve responses into a temporary map and publish only if the capture is still current. [VERIFIED: codebase grep] A route update is important because `GameDetails.vue` explicitly reuses its instance when moving from `/rom/:id` to another ROM. [VERIFIED: codebase grep]

Keep a cache scoped by active account within the resolver instance, keyed by IGDB ID. Cache confirmed `local` and confirmed `absent` entries, but not `error`. Clear the cache when account identity changes and on composable disposal. Keep a separate in-flight map so duplicate IDs in the same source list await the same promise instead of producing duplicate calls. This is bounded by encountered recommendations, does not load the library, and prevents a stale account's visibility result from being reused. [VERIFIED: codebase grep]

### Filtering rule

Derive the rendered list from the resolved full ordered list:

```ts
const allowed = enabled
  ? entries
  : entries.filter((entry) => entry.resolution.status === "local");
const visible = allowed.slice(0, 6);
```

When preference readiness is unknown, the disabled-safe output is an empty list. When enabled and ready, pending, absent, and error entries may render as external cards exactly as current behavior does. When disabled, only `local` entries can render. [VERIFIED: codebase grep]

`OverviewTab` must use the derived visible list for both `hasRelated` and the Similar-games `v-if`; it must not render a heading or placeholder for empty, pending-only, absent-only, or error-only disabled results. Replace the literal heading with `t("rom.similar-games")`. [VERIFIED: codebase grep]

### Card and grid integration

Add a narrow optional resolved-Similar input to `RelatedGamesGrid`, then pass its values to `RelatedGameCard`. For that controlled path, the card must not call `getRomByMetadataProvider`; it routes to the supplied local ROM ID when present. In enabled mode only, non-local controlled entries retain the existing IGDB `window.open` destination. In disabled mode they are excluded before cards exist. [VERIFIED: codebase grep]

Preserve the existing raw-item interface and card-owned lookup as the default for all callers other than the Similar-games section. This prevents the phase from changing DLC, expansion, remake, or remaster behavior. [VERIFIED: codebase grep]

### Storybook integration

Storybook loads v2 `*.stories.*` files and its preview creates Vue with Pinia, i18n, and Vuetify providers. Composite stories use `compositionParameters()` and are registered in `compositionInventory.ts`; the catalog checker also reads `frontend/scripts/storybook-language-decisions.json`. [VERIFIED: codebase grep]

Add real-component stories, preferably a settings story near `SettingsToggleRow` and a related-games composition story near the GameDetails components. Include the required German paths and states from `42-UI-SPEC.md`: setting, enabled mixed results, disabled local-only results, a local result after position seven, resolving, no library matches, and lookup error. Inject resolved deterministic entries rather than live HTTP. Add the exact story file paths to the composition inventory and decision ledger. [VERIFIED: codebase grep]

## Component Responsibilities

| Component or file | Change responsibility | Must not do |
| --- | --- | --- |
| `useUISettings.ts` | Register and account-authoritatively initialize the preference and expose readiness needed to prevent a flash. | Add another store or persistence channel. [VERIFIED: codebase grep] |
| `useSimilarGameLibraryResolution.ts` | Deduplicate, cache safely by account, capture generations, classify outcomes, and derive visible ordered entries. | Fetch the catalog/library list or mutate user settings. [VERIFIED: codebase grep] |
| `GameDetails.vue` | Pass the complete Similar-games provider list plus active game/account/preference inputs to the resolver. | Slice Similar games before resolver filtering. [VERIFIED: codebase grep] |
| `OverviewTab.vue` | Mount the localized Similar-games section only when the resolver result is non-empty. | Recompute ownership or expose a disabled empty/error panel. [VERIFIED: codebase grep] |
| `RelatedGamesGrid.vue` | Render supplied resolved Similar-game entries through real cards. | Start lookups for the controlled Similar-games path. [VERIFIED: codebase grep] |
| `RelatedGameCard.vue` | Use a supplied local route target, otherwise preserve enabled external fallback. | Independently overwrite central resolver state. [VERIFIED: codebase grep] |
| Locale files and Storybook artifacts | Add translated keys and deterministic real-component demonstrations. | Use hard-coded display strings or lookalike fixtures. [VERIFIED: codebase grep] |
| `docs/FRONTEND_ARCHITECTURE.md` | Document preference default, account/cache boundary, four states, and filter-before-limit flow. | Claim a backend contract change that does not exist. [VERIFIED: codebase grep] |

## Common Pitfalls

### Cross-account local-storage leakage

**What goes wrong:** The disabled value from one account is used for an account with no stored preference, violating the required default. [VERIFIED: codebase grep]

**Why it happens:** The current initializer only assigns backend keys that are present, and local-storage refs are singleton state. [VERIFIED: codebase grep]

**Prevention:** Reset this preference from the active account's settings object to explicit boolean or `true` before the Similar-games view becomes eligible to display external cards. Track readiness and account identity. [VERIFIED: codebase grep]

### Early six-card truncation

**What goes wrong:** A confirmed local result at source position seven or later can never move into the disabled view. [VERIFIED: codebase grep]

**Prevention:** Pass the full provider sequence to the resolver, filter it, then limit the result to six. [VERIFIED: codebase grep]

### Per-card duplication and stale writes

**What goes wrong:** Mounting several cards repeats equivalent lookups and late responses can alter a newly navigated detail view. [VERIFIED: codebase grep]

**Prevention:** Deduplicate in-flight and cached results above the grid and publish result maps only for the current game/account/preference capture. [VERIFIED: codebase grep]

### Collapsing error into absence

**What goes wrong:** A transient 401, network error, or server error is cached as not owned, hiding a later valid local card. [VERIFIED: codebase grep]

**Prevention:** Use the four-state model. Cache only confirmed local or confirmed absence; leave errors retryable and visually fail closed when disabled. [VERIFIED: codebase grep]

### Accidental scope expansion

**What goes wrong:** Altering `RelatedGameCard` lookup behavior globally changes remakes, remasters, DLCs, or expansions. [VERIFIED: codebase grep]

**Prevention:** Make central resolution an explicit Similar-games-only path with a backwards-compatible default for all existing callers. [VERIFIED: codebase grep]

### Storybook realism regression

**What goes wrong:** A story demonstrates copied markup but not the actual setting/card/grid contracts, or is absent from catalog metadata. [VERIFIED: codebase grep]

**Prevention:** Compose `SettingsToggleRow`, `SettingsSection`, `RelatedGamesGrid`, and `RelatedGameCard` directly, with deterministic resolved-entry data and inventory/ledger declarations. [VERIFIED: codebase grep]

## Documentation Work

Update `docs/FRONTEND_ARCHITECTURE.md` in the ROM-detail and caching sections to describe: the account-scoped `showSimilarGamesOutsideLibrary` default, the existing metadata-provider ownership lookup, the four resolver outcomes, generation rejection, cache lifetime, and the exact filter-before-six sequence. [VERIFIED: codebase grep] No API route, schema, generated type, or backend architecture update is expected because the existing protected endpoint already provides the needed result. [VERIFIED: codebase grep]

## Pre-UAT Validation Plan

The human decision for this job overrides the normal Nyquist test workflow. Do not add test files, change existing tests, or run a test suite before human acceptance. [VERIFIED: job instructions]

After implementation, run only the prescribed non-test technical checks: frontend typecheck, production build, Storybook catalog/rendering verification, and manual browser inspection. Record the following in the phase `sichtpruefung.md`: Settings and Game Details routes, all seven Storybook names and start paths, desktop 1440px and mobile 390px screenshots, pointer and keyboard switch use, local navigation, promoted-after-six behavior, empty section removal, lookup-error safety, and any limitations. [VERIFIED: job instructions]

## Security Domain

| Category | Applicability | Control |
| --- | --- | --- |
| Authentication and session | Applies | Use the active authenticated account identity in resolver generations and cache scope. [VERIFIED: codebase grep] |
| Authorization and access control | Applies | Rely on the protected metadata-provider endpoint and its server-side `assert_rom_visible` result as ownership proof. [VERIFIED: codebase grep] |
| Input validation | Applies | Send only numeric IGDB IDs already supplied by typed `IGDBRelatedGame` metadata; skip invalid IDs. [VERIFIED: codebase grep] |
| External navigation | Applies | Retain current IGDB construction and `window.open(..., "_blank", "noopener,noreferrer")` only when enabled. [VERIFIED: codebase grep] |

## Assumptions Log

| # | Claim | Section | Risk if wrong |
| --- | --- | --- |
| A1 | A composable named `useSimilarGameLibraryResolution` is the final filename. | Recommended Architecture Patterns | Low, the planner may choose an equivalently focused existing v2 location. |
| A2 | Confirmed 404 is the appropriate `absent` classification while other request failures stay `error`. | Existing Implementation Findings | Medium, implementation must inspect the API client's error shape and preserve its established retry semantics. |

## Open Questions

None requiring a product decision. The planner must inspect the API-client error shape while implementing A2, but the required product behavior is already locked: only a confirmed absence may be filtered as non-local and an error remains retryable. [VERIFIED: job context]

## Environment Availability

No external service, package, or tool is required for implementation research. The phase uses existing frontend code and the existing authenticated API contract. Browser and Storybook inspection are required only after implementation, before human UAT. [VERIFIED: codebase grep]

## Sources

### Primary

- `[VERIFIED: codebase grep]` `frontend/src/composables/useUISettings.ts`, registry, initialization, persistence, user identity and save sequence.
- `[VERIFIED: codebase grep]` `frontend/src/v2/views/GameDetails.vue`, full detail data ownership and current early Similar-games cap.
- `[VERIFIED: codebase grep]` `frontend/src/v2/components/GameDetails/OverviewTab.vue`, section visibility and current literal heading.
- `[VERIFIED: codebase grep]` `frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue` and `RelatedGameCard.vue`, current card rendering, lookup and navigation ownership.
- `[VERIFIED: codebase grep]` `frontend/src/services/api/rom.ts` and `backend/endpoints/roms/__init__.py`, existing metadata lookup and visibility enforcement.
- `[VERIFIED: codebase grep]` `frontend/src/v2/composables/useMetadataMatchLanguage/index.ts`, generation-acceptance precedent.
- `[VERIFIED: codebase grep]` `frontend/.storybook/preview.ts`, `frontend/src/v2/storybook/compositionInventory.ts`, `frontend/scripts/check-storybook-catalog.ts`, and `frontend/scripts/storybook-language-decisions.json`.
- `[VERIFIED: codebase grep]` `docs/FRONTEND_ARCHITECTURE.md`, current v2, i18n, caching, Storybook, and tooling architecture.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH, all required frontend components and API calls already exist locally. [VERIFIED: codebase grep]
- Architecture: HIGH, current source ownership and the relevant protected endpoint were inspected. [VERIFIED: codebase grep]
- Pitfalls: HIGH, the early cap, per-card lookup, singleton local storage, and route reuse are directly visible in source. [VERIFIED: codebase grep]

**Research date:** 2026-11-10
**Valid until:** 2026-12-10, subject to changes in this checkout.
