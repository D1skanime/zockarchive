---
phase: 42
slug: hnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
status: draft
shadcn_initialized: false
preset: none
created: 2026-11-10
---

# Phase 42 UI Design Contract

> Visual and interaction contract for the per-user related-games visibility preference. It extends the existing ZA-v2 surfaces and must not introduce a parallel setting control, related-card layout, or library ownership indicator.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none, ZA-v2 has its own token and primitive system |
| Preset | not applicable |
| Component library | ZA-v2 primitives and feature components, Vue 3 + Vuetify host only |
| Icon library | Material Design Icons through `ZAIcon` |
| Font | `var(--r-font-family-sans)` |
| Source of visual truth | `frontend/src/v2/styles/tokens.css`, `SettingsToggleRow.vue`, `RelatedGamesGrid.vue`, and `RelatedGameCard.vue` |

`components.json` is absent and this is a Vue application, so the shadcn initialization gate does not apply. Do not add a registry dependency or a third-party component for this phase.

## Components and placement

| Surface | Required composition | Contract |
|---------|----------------------|----------|
| Settings, User interface | Existing `SettingsSection` and the existing two-column `r-v2-ui__toggle-grid`, with one real `SettingsToggleRow` bound to `useUISettings` | Add the preference to the most relevant existing user-interface toggle group. It uses the row's label, description, hover, focus, disabled, pointer, Enter and Space behavior unchanged. It has no separate save button and no confirm dialog. |
| Game details, Overview | Existing `OverviewTab` related-content area, existing section heading styling, and one `RelatedGamesGrid` | The Similar games heading and grid mount only when the derived visible list has at least one card. Other related-content groups remain unchanged. |
| Related card | Existing `RelatedGameCard` and `GameCard` visual contract | A confirmed local target keeps the existing owned chip and navigates to the resolved ZA ROM. With the preference enabled, unresolved or absent targets keep the present external IGDB destination. Never show an external card or external destination while the preference is disabled. |

The setting is a per-account preference named `showSimilarGamesOutsideLibrary`, defaulting to `true`. The runtime value must be authoritative as soon as the active account is known: a missing persisted value resolves to `true`; an explicitly persisted `false` prevents an external card from mounting even for one frame.

## Spacing Scale

Use the existing token scale. The following values are the only new-layout spacing values permitted for this phase.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon and state gaps |
| sm | 8px | Compact card and label spacing |
| md | 16px | Setting-row internal and grid-column spacing |
| lg | 24px | Related-content section separation |
| xl | 32px | Major overview grouping separation |
| 2xl | 48px | Existing page-level separation only |
| 3xl | 64px | Existing page-level separation only |

Use the existing `RelatedGamesGrid` gap and padding (`20px 16px`, `6px 6px 4px`) rather than a new grid rule. The `44px` `--r-touch-target` remains the minimum interactive target, supplied by the existing switch and card primitives. No exception is required.

## Typography

Reuse existing token roles; do not introduce a type scale for this preference.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Setting description | Existing `SettingsToggleRow` 11px | existing inherited weight | 1.4 |
| Setting label | Existing `SettingsToggleRow` 13px | existing medium token | inherited |
| Related section heading | Existing `overview-tab__section-heading` styling | existing inherited heading weight | inherited |
| Card label | Existing `GameCard` styling | existing inherited weight | inherited |

This preference does not alter the type scale. Existing inherited `RelatedGamesGrid` uppercase tracking and heading styling stay unchanged.

## Color

Use semantic ZA-v2 tokens in both themes, never new hex values.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--r-color-bg`, `--r-color-bg-elevated` | Page background and setting-row surface |
| Secondary (30%) | `--r-color-surface`, `--r-color-border`, cover-art surfaces | Toggle grid divider, related-card context, navigation and existing cards |
| Accent (10%) | `--r-color-brand-primary` | Enabled setting label and the already-established local-owned card chip only |
| Destructive | `--r-color-danger` | Not used; this preference has no destructive action |

Accent is reserved for the enabled preference's existing row state and the existing confirmed-local owned chip. It must not be used to turn external cards into warnings or to add a new status color for loading, no-match, or lookup error.

Visual focus remains explicit: the settings surface centers the existing translated label and switch, while the overview centers its existing Similar games heading and the unchanged wrapped card grid. No second badge, alert, or explanatory panel competes with either focus.

## Interaction and responsive contract

### Settings

- Localized label key: `settings.show-similar-games-outside-library`. German copy: `Ähnliche Spiele ausserhalb der Bibliothek anzeigen`.
- Localized help key: `settings.show-similar-games-outside-library-desc`. German copy: `Zeigt auch ähnliche Spiele an, die nicht in deiner Bibliothek verfügbar sind.`
- Add both keys to every locale's `settings.json`, following the existing locale-key parity convention. The control's accessible name is its translated label and its `aria-checked` state is owned by `SettingsToggleRow`.
- Pointer click, Tab then Space, and Tab then Enter toggle the one outer `button[role="switch"]`. Focus uses the existing v2 input-mode ring. Do not nest another button or switch in the row.
- At 1440px the row participates in the current two-column setting grid. At 390px the existing `xs` breakpoint collapses that grid to one column; the label and description wrap while the switch remains visible at the trailing edge.

### Similar-games visibility states

The visible card list is derived from the full ordered IGDB `similar_games` list, then limited to six. It is not a separate sort or a paginated library view.

| Preference / resolution state | Visible overview result |
|-------------------------------|-------------------------|
| Enabled | Preserve the current provider order and show the first six entries. Confirmed local entries use their ZA destination; absent or unresolved entries retain the external IGDB destination. |
| Disabled, resolving | Render only already confirmed local entries, if any. Pending entries render neither a card nor an external fallback. If no confirmed local entry exists yet, mount neither the Similar games heading nor its grid. |
| Disabled, complete with local matches | Preserve provider order, retain only confirmed local matches, then take the first six. A confirmed local match after original position six must therefore move into view. |
| Disabled, no matches | Do not mount the Similar games heading, grid, empty message, or layout placeholder. |
| Disabled, lookup error | Keep the error distinct in resolver state and retry behavior. Render confirmed local entries only; failed IDs are not treated as absent and no external fallback, inline error banner, or error-colored card may appear. If that leaves no local entry, the visual result is the same deliberately empty overview context as no-match. |
| Stale response after game, account, or preference change | Ignore it completely. It must not change the current section, card target, or visible card count. |

The Similar games section heading receives a locale key, `rom.similar-games`, in every `rom.json`; German copy is `Ähnliche Spiele`. Use the localized heading rather than the current literal. There is intentionally no customer-facing empty or error copy for this scoped section: displaying an empty/error panel would contradict the required absence of the whole section and could disclose a pending external item.

At 1440px preserve the existing wrapped 158px card layout and section heading. At 390px preserve the same flex-wrap grid, its cover sizes, and bottom-navigation clearance. Cards retain the existing keyboard activation behavior; a local card opens the matched ZA detail route, while an enabled external card opens IGDB as before.

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | No CTA. The setting itself is an immediate on/off preference. |
| Switch label | `Ähnliche Spiele ausserhalb der Bibliothek anzeigen` (`settings.show-similar-games-outside-library`) |
| Switch help | `Zeigt auch ähnliche Spiele an, die nicht in deiner Bibliothek verfügbar sind.` (`settings.show-similar-games-outside-library-desc`) |
| Similar section heading | `Ähnliche Spiele` (`rom.similar-games`) |
| Empty state heading/body | None in product. With the preference off and no confirmed library match, the full section including its heading is absent. |
| Error state | None in product. Preserve the resolver's distinct error state for retry and Storybook evidence while never substituting an error for a no-match or exposing external cards. |
| Destructive confirmation | None. |

The German strings above are canonical copy for the locale source. Each existing locale needs a translated equivalent, not a fallback literal in a Vue template.

## Loading, cache, and accessibility boundaries

- Resolution is a data boundary above `RelatedGameCard`; cards consume a supplied confirmed local destination and must not start their own ownership lookup for this section.
- Deduplicate IGDB IDs before lookup. Cache successful account-scoped resolutions only inside the documented safe cache boundary. Do not cache lookup errors as confirmed absence.
- The state model remains four-valued for every ID: pending, confirmed local target, confirmed absent, and error. This is necessary even where the disabled visual output intentionally omits a card.
- The resolver generation includes current game identity, active account identity, and preference state. A response with an obsolete generation is discarded before reactive UI state changes.
- The visual absence of the disabled no-match state is not announced as an error. Normal document order remains contiguous, avoiding a focus trap or an empty heading. When a card appears after resolution, it is a normal interactive `GameCard`, not an auto-focused live-region interruption.

## Storybook contract

Create stories with the real components, German Storybook taxonomy, and deterministic in-memory provider data. They need no live provider or HTTP request.

| Story name and start path | Required composition and evidence |
|---------------------------|-----------------------------------|
| `Formulare/Einstellungen/SettingsToggleRow/Ähnliche Spiele ausserhalb der Bibliothek` | A real `SettingsToggleRow` in the same `SettingsSection` / `r-v2-ui__toggle-grid` context as `UserInterface.vue`; demonstrate initial on and an interactive off state, including keyboard operation. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/An: gemischte Empfehlungen` | Real Overview context plus `RelatedGamesGrid` and `RelatedGameCard`; six-or-fewer provider-ordered cards containing both confirmed-local and external targets. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: nur Bibliothekstreffer` | Same real composition with the preference off; visible cards are confirmed-local only, in provider order. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Treffer nach Position sieben` | Full source list includes at least seven earlier non-local entries and a local target later than position seven; the later local target is visibly promoted into the maximum-six result. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Auflösung läuft` | Pending entries expose no external card. Include any already-confirmed local card to show allowed partial progress. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: keine Bibliothekstreffer` | Render the surrounding Overview context but neither Similar games heading nor grid, proving that the empty state removes both. |
| `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Lookup-Fehler` | Deterministic resolver error data. Show that the overview remains safe: confirmed locals may remain, failed IDs are neither shown externally nor represented as absent. |

Stories must use the preview's existing Pinia, i18n, router, dark/light theme decorator, and the actual feature components. Do not recreate card or switch markup in a fixture. Add each new story module to the composition inventory and language-decision ledger as required by the existing Storybook catalog policy.

## Pre-UAT visual checks

Before human UAT, record these in phase `sichtpruefung.md`, with screenshot paths and any limitation:

1. The settings story and live Settings → User interface page at 1440px and 390px, including pointer and keyboard switch operation.
2. All seven named Storybook cases in both existing themes, including the contextual no-match view and lookup-error fixture.
3. A live game-details overview at 1440px and 390px: enabled mixed recommendations, disabled local-only filtering, a local target promoted from after source position six, local-card navigation, no-match removal, and changing game/account/preference while a lookup is pending.

Run the prescribed typecheck/build and Storybook catalog/rendering checks after implementation, but add or run no tests before human acceptance.

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | Not applicable. No shadcn initialization and no third-party registry are involved. |

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
