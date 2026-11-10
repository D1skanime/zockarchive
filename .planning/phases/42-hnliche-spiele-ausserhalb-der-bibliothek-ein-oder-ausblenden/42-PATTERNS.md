# Phase 42: Ähnliche Spiele ausserhalb der Bibliothek ein- oder ausblenden - Pattern Map

**Mapped:** 2026-11-10  
**Files analyzed:** 32 planned additions or modifications  
**Analogs found:** 32 / 32

## File Classification

| New/Modified File | Role | Data flow | Closest analog | Match quality |
|---|---|---|---|---|
| `frontend/src/composables/useUISettings.ts` | composable / preference store | request-response, reactive persistence | same file, `initialize()` and save identity guard | exact |
| `frontend/src/v2/composables/useSimilarGameLibraryResolution.ts` | composable | async request-response, reactive transform | `frontend/src/v2/composables/useMetadataMatchLanguage/index.ts` | role-match |
| `frontend/src/v2/views/Settings/UserInterface.vue` | view / feature composite | reactive preference binding | same file, Gallery and Gameplay toggle rows | exact |
| `frontend/src/v2/views/GameDetails.vue` | route orchestrator | reactive data flow | same file, related-game prop hand-off | exact |
| `frontend/src/v2/components/GameDetails/OverviewTab.vue` | feature composite | reactive derived rendering | same file, related-section predicate and mount gate | exact |
| `frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue` | feature composite | transform / card composition | same file, `localCandidates` mapping | exact |
| `frontend/src/v2/components/GameDetails/RelatedGameCard.vue` | feature composite | request-response navigation | same file, supplied-local versus external destination | exact |
| `frontend/src/v2/components/Settings/SettingsToggleRow.stories.ts` (new) | Storybook composite | event-driven local model | `frontend/src/v2/components/shared/AssetStrip.stories.ts` | role-match |
| `frontend/src/v2/components/GameDetails/RelatedGamesGrid.stories.ts` (new) | Storybook feature composition | deterministic transform / rendering | `frontend/src/v2/components/GameDetails/MediaManagement.stories.ts` | role-match |
| `frontend/src/v2/storybook/compositionInventory.ts` | Storybook catalogue config | static registry | same file, composite-entry registry | exact |
| `frontend/scripts/storybook-language-decisions.json` | Storybook catalogue config | static language ledger | same file, per-visible-candidate objects | exact |
| `frontend/src/locales/{18 locales}/settings.json` | i18n config | static lookup | `frontend/src/locales/en_US/settings.json` sorted setting pairs | exact |
| `frontend/src/locales/{18 locales}/rom.json` | i18n config | static lookup | `frontend/src/locales/en_US/rom.json` sorted ROM heading keys | exact |
| `docs/FRONTEND_ARCHITECTURE.md` | architecture documentation | data-flow documentation | Component Architecture, i18n, and Caching Strategy sections | role-match |

The locale rows represent 36 concrete JSON files: `settings.json` and `rom.json` in `en_US`, `en_GB`, `bg_BG`, `cs_CZ`, `de_DE`, `es_ES`, `fr_FR`, `hu_HU`, `it_IT`, `ja_JP`, `ko_KR`, `pl_PL`, `pt_BR`, `ro_RO`, `ru_RU`, `tr_TR`, `zh_CN`, and `zh_TW`.

## Pattern Assignments

### `frontend/src/composables/useUISettings.ts` (composable, request-response persistence)

**Analog:** this module's registry, initialization, and save race guard.

**Registry and typed local-storage pattern** ([lines 9-15, 95-132](../../../../frontend/src/composables/useUISettings.ts:9)):

```ts
export const UI_SETTINGS_KEYS = {
  theme: { key: "settings.theme", default: "auto" },
  // ...
} as const;

const localStorageRefs = Object.fromEntries(
  Object.entries(UI_SETTINGS_KEYS).map(([name, config]) => [
    name,
    useLocalStorage(config.key, config.default),
  ]),
) as UISettingsRefs;
```

Add `showSimilarGamesOutsideLibrary: { key: "settings.showSimilarGamesOutsideLibrary", default: true }` in the registry rather than inventing state elsewhere.

**Backend synchronization and active-user race guard** ([lines 164-193](../../../../frontend/src/composables/useUISettings.ts:164)):

```ts
const userId = user.value.id;
const sequence = ++saveSequence;
// ... await userApi.updateUser(...)
if (user.value?.id !== userId || sequence !== saveSequence) return false;
```

Keep this save protocol. Extend initialization specifically for the new boolean: when an active user is known, assign the explicit boolean if it exists, otherwise assign `true`, and expose readiness tied to the active account. The present generic loop only copies keys that exist ([lines 135-152](../../../../frontend/src/composables/useUISettings.ts:135)); copying it unchanged leaks a prior account's local value when the current account lacks the new key.

**Reactive account initialization trigger** ([lines 206-215](../../../../frontend/src/composables/useUISettings.ts:206)):

```ts
watch(
  user,
  (newUser) => {
    const userWithSettings = newUser as UserSchema | null;
    if (userWithSettings?.ui_settings) initialize();
  },
  { immediate: true },
);
```

Update this path so a known account with an absent setting is authoritatively ready and defaults enabled. Before that readiness, the Similar-games consumer must fail closed for external cards.

---

### `frontend/src/v2/composables/useSimilarGameLibraryResolution.ts` (new composable, async request-response transform)

**Analog:** `frontend/src/v2/composables/useMetadataMatchLanguage/index.ts`.

**Generation capture and stale-result acceptance** ([lines 4-36](../../../../frontend/src/v2/composables/useMetadataMatchLanguage/index.ts:4)):

```ts
let generation = 0;
const accepted = shallowRef<MatchLanguageCapture | null>(null);

function begin(locale?: string | null): MatchLanguageCapture {
  reset();
  return Object.freeze({ generation, metadataLocale: normalizeLocale(locale?.trim() || "en") });
}

function isCurrent(capture: MatchLanguageCapture): boolean {
  return capture.generation === generation;
}
```

Use this small, immutable-capture pattern, but capture `{ generation, gameId, accountId, preference, ready }`. Clear or publish safe pending output before requests, then accept result maps only if all captured context remains current. The composable owns an account-scoped successful-result cache and an in-flight map keyed by numeric IGDB ID. Clear both on account change/disposal. Cache `local` and confirmed `absent`, never `error`.

**Existing authorized lookup contract** ([`frontend/src/services/api/rom.ts` lines 631-641](../../../../frontend/src/services/api/rom.ts:631)):

```ts
return api.get<DetailedRom>(`/roms/by-metadata-provider/`, {
  params: { [field]: id },
});
```

Call it only as `{ field: "igdb_id", id }`, after `Set`-based ID deduplication. Classify successful response as `{ status: "local", romId: response.data.id }`; only the established confirmed no-match outcome is `absent`; all other rejected calls are `error`. The protected backend endpoint remains the ownership proof, so no backend/API type changes belong in this phase.

**Required derived-list contract:** derive from the complete provider sequence, preserving its order. When preference readiness is unknown output `[]`; when enabled output all entries then `.slice(0, 6)`; when disabled first retain only `{ status: "local" }`, then `.slice(0, 6)`. Do not mutate settings or fetch library pages here.

---

### `frontend/src/v2/views/Settings/UserInterface.vue` (view, reactive preference binding)

**Analog:** existing `SettingsToggleRow` v-model composition ([lines 310-347](../../../../frontend/src/v2/views/Settings/UserInterface.vue:310)).

```vue
<SettingsToggleRow
  v-model="showStatus"
  :title="t('settings.show-status')"
  :description="t('settings.show-status-desc')"
/>
```

Destructure the new ref from `useUISettings()` with the nearby Gallery values ([lines 52-64](../../../../frontend/src/v2/views/Settings/UserInterface.vue:52)) and place one row in the existing user-interface toggle grid. Use `t("settings.show-similar-games-outside-library")` and its `-desc` key. Do not add a raw switch, handler, save button, or new persistence path.

`SettingsToggleRow` is already the keyboard/accessibility implementation: its outer `button[role="switch"]` owns `aria-checked`, disabled state, and native click/keyboard activation ([lines 31-83](../../../../frontend/src/v2/components/Settings/SettingsToggleRow.vue:31)).

---

### `frontend/src/v2/views/GameDetails.vue` (route orchestrator, reactive data flow)

**Analog:** the existing detail-to-overview prop flow ([lines 501-522](../../../../frontend/src/v2/views/GameDetails.vue:501)).

```vue
<OverviewTab
  v-if="tab === 'overview'"
  :rom="currentRom"
  :expansions="expansions"
  :remakes="remakes"
  :remasters="remasters"
  :similar-games="similarGames"
/>
```

Replace the early-cap source at [lines 314-321](../../../../frontend/src/v2/views/GameDetails.vue:314) with the full `igdb_metadata.similar_games` input to the resolver, and pass its already-derived visible resolved entries to `OverviewTab`. Follow the existing `onBeforeRouteUpdate` awareness ([lines 64-94](../../../../frontend/src/v2/views/GameDetails.vue:64)): route instances are reused, so supply reactive active ROM and active account identity to the resolver rather than treating the initial mount as final.

---

### `frontend/src/v2/components/GameDetails/OverviewTab.vue` (feature composite, derived rendering)

**Analog:** its existing related predicate and section mount gate ([lines 193-204](../../../../frontend/src/v2/components/GameDetails/OverviewTab.vue:193), [lines 477-535](../../../../frontend/src/v2/components/GameDetails/OverviewTab.vue:477)).

```ts
const hasRelated = computed(
  () => props.expansions.length + props.dlcs.length + /* ... */ props.similarGames.length > 0,
);
```

```vue
<div v-if="similarGames.length" class="overview-tab__section">
  <h4 class="overview-tab__section-heading">...</h4>
  <RelatedGamesGrid title="" :items="similarGames" />
</div>
```

Change the Similar input to the resolver result type and use its visible-entry length in both places. Localize the literal heading using `t("rom.similar-games")`. The empty, pending-only, and error-only disabled result must mount neither heading nor grid. Do not change the independent DLC, expansion, remake, or remaster branches.

---

### `frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue` and `RelatedGameCard.vue` (feature composites, transform and navigation)

**Analog:** current supplied-local card mapping and fallback navigation.

`RelatedGamesGrid` builds an indexed `Map` once and passes enriched values into real cards ([lines 28-53](../../../../frontend/src/v2/components/GameDetails/RelatedGamesGrid.vue:28)):

```ts
const localByIgdbId = new Map(
  (props.localCandidates ?? []).map((candidate) => [candidate.igdbId, candidate]),
);
return props.items.map((game) => ({ game, local: localByIgdbId.get(game.id) }));
```

Extend this same thin renderer with an optional controlled Similar-games entry path, passing `localRomId` and a `skipLookup`/equivalent explicit contract to `RelatedGameCard`. Preserve the raw `items` default for all current callers.

`RelatedGameCard` provides the exact destination precedence to preserve ([lines 47-59](../../../../frontend/src/v2/components/GameDetails/RelatedGameCard.vue:47), [lines 175-198](../../../../frontend/src/v2/components/GameDetails/RelatedGameCard.vue:175)):

```ts
if (inLibrary.value) {
  void router.push(`/rom/${romId.value}`);
  return;
}
window.open(`https://www.igdb.com/games/${props.game.slug}`, "_blank", "noopener,noreferrer");
```

For controlled Similar entries, initialize/use the supplied `localRomId` and do not run the `onMounted` lookup. For non-controlled callers retain that lookup exactly, protecting the out-of-scope related categories. A controlled non-local card only exists while preference is enabled, so the existing external fallback stays correct without rendering an external card in disabled mode.

---

### Storybook files and catalogue (Storybook composite, deterministic rendering)

**Analogs:** `frontend/src/v2/components/GameDetails/MediaManagement.stories.ts` and `frontend/src/v2/components/shared/AssetStrip.stories.ts`.

Use the established typed meta plus catalogue registration ([`MediaManagement.stories.ts` lines 64-73](../../../../frontend/src/v2/components/GameDetails/MediaManagement.stories.ts:64)):

```ts
const meta: Meta<typeof MediaManagementCard> = {
  title: "Im Einsatz/Zusammengesetzt/Medienverwaltung",
  component: MediaManagementCard,
  parameters: compositionParameters("components/GameDetails/MediaManagement.stories.ts"),
};
```

Stories use in-memory typed fixtures and `render()` composition, not HTTP ([`MediaManagement.stories.ts` lines 85-100](../../../../frontend/src/v2/components/GameDetails/MediaManagement.stories.ts:85)). The new setting story must mount the actual `SettingsSection`, existing `r-v2-ui__toggle-grid`, and `SettingsToggleRow`; the detail stories must mount actual overview/grid/card components and inject resolver-shaped data. Follow the seven German paths/names mandated by `42-UI-SPEC.md`, including no-heading Overview context and error/resolving states.

Register each new module as an exact key in `compositionInventory` ([lines 14-43](../../../../frontend/src/v2/storybook/compositionInventory.ts:14)), and call `compositionParameters()` with the exact same relative path. Add every newly detected static visible candidate as a narrow line-specific entry in `storybook-language-decisions.json`, matching its `{ category, file, location, text, status }` object shape ([lines 1-14](../../../../frontend/scripts/storybook-language-decisions.json:1)). Do not create a file-wide exemption.

---

### `frontend/src/locales/*/{settings,rom}.json` (i18n config, static lookup)

**Analog:** the sorted key/value structure in `en_US/settings.json` and `en_US/rom.json`.

Every locale receives both setting keys and the heading key:

```json
"show-similar-games-outside-library": "...",
"show-similar-games-outside-library-desc": "...",
"similar-games": "..."
```

Use the locale-native established terminology and maintain alphabetic order. `42-UI-SPEC.md` fixes the German values as `Ähnliche Spiele ausserhalb der Bibliothek anzeigen`, `Zeigt auch ähnliche Spiele an, die nicht in deiner Bibliothek verfügbar sind.`, and `Ähnliche Spiele`. This is 18 updates per namespace, not an English fallback.

---

### `docs/FRONTEND_ARCHITECTURE.md` (architecture documentation, data-flow)

**Analog:** the component/storybook responsibility description ([lines 184-217](../../../../docs/FRONTEND_ARCHITECTURE.md:184)) and caching/i18n sections ([lines 300-320](../../../../docs/FRONTEND_ARCHITECTURE.md:300)).

Document the actual shared flow next to these architecture descriptions: `showSimilarGamesOutsideLibrary` defaults true per account; `useUISettings` readiness prevents cross-account leakage; the existing protected metadata-provider lookup establishes a local target; resolver states are pending/local/absent/error; cache successes only per account and reject stale generation output; filter confirmed local entries before six when disabled. State that the endpoint/API contract did not change, so backend architecture and generated types require no update.

## Shared Patterns

### Account and stale-response safety

**Sources:** `frontend/src/composables/useUISettings.ts` lines 164-193 and `frontend/src/v2/composables/useMetadataMatchLanguage/index.ts` lines 9-36.

Capture identity/sequence before awaiting, then compare it before publishing. The preference's backend value is authoritative once an account is known. A missing persisted value is `true`, not the previous account's browser-local value.

### Ownership authorization

**Source:** `frontend/src/services/api/rom.ts` lines 631-641.

The single metadata-provider endpoint is the only allowed browser-side evidence of accessible ownership. Do not query the paginated library, infer from game titles, or add an API endpoint.

### Presentation ownership

**Sources:** `RelatedGamesGrid.vue` lines 28-71 and `RelatedGameCard.vue` lines 47-59, 175-219.

The resolver decides membership and destinations above the grid; grid/cards render and navigate that supplied result. Existing card-owned lookup remains the backwards-compatible default for out-of-scope related categories.

### Storybook and visible text governance

**Sources:** `compositionInventory.ts` lines 14-140, `storybook-language-decisions.json` lines 1-14, and `docs/FRONTEND_ARCHITECTURE.md` lines 188-217.

Composite stories must use the real components, declare direct primitive dependencies in the inventory, and record every visible static German text candidate in the ledger.

## No Analog Found

None. The resolver is new, but the generation capture, successful request caching boundary, and card-composition contracts have direct local precedents.

## Metadata

**Analog search scope:** `frontend/src/composables`, `frontend/src/v2`, `frontend/src/services`, `frontend/src/locales`, `frontend/scripts`, `docs`  
**Files scanned:** 17 primary implementation/configuration/doc files, plus the 36 locale targets enumerated above  
**Pattern extraction date:** 2026-11-10
