---
phase: 41
slug: za-scan-bersicht-f-r-gro-e-bibliotheken
status: draft
shadcn_initialized: false
preset: none
created: 2026-11-07
---

# Phase 41: UI Design Contract

> Visual and interaction contract for the v2 scan overview at `/scan`.

## Sources and scope

| Source | Decisions used |
| --- | --- |
| `41-CONTEXT.md` | Reliable running progress and platform, compact completed result, actionable outcomes, on-demand operation-wide details, synthetic 1,000-game inspection and no pre-UAT tests |
| `ROADMAP.md`, Phase 41 | All six phase requirements and the five success criteria |
| `REQUIREMENTS.md` | `ZA-SCAN-41-01` through `ZA-SCAN-41-06` |
| Existing Scan v2 components and composables | Existing operation lifecycle, `ZA*` primitives, semantic tokens, localization, status recovery and paged adapter boundary |
| `.claude/skills/frontend-v2-{components,theming,input,patterns}/SKILL.md`, `frontend-i18n/SKILL.md` | Component ownership, tokens, universal input, URL state, pagination and locale parity |

This phase changes the operation overview and result exploration only. It must not change scan submission, scan settings, the Socket.IO lifecycle, permissions, retry semantics, or the existing live platform log. The backend remains authoritative for all progress, counts, result data, search and filters.

## Design System

| Property | Value |
| --- | --- |
| Tool | Existing ZockArchive v2 design system, shadcn is not applicable to the Vue/Vuetify stack |
| Preset | Not applicable |
| Component library | Existing `ZA*` primitives over Vue 3 and Vuetify |
| Icon library | Existing Material Design Icons through primitive props |
| Font | `--r-font-family-sans`; use `--r-font-family-mono` only for safe relative file paths |
| Theme | Existing `.r-v2.r-v2-dark` and `.r-v2.r-v2-light` semantic-token themes |

Use existing semantic variables only. Do not add hex or `rgba()` literals, edit generated `tokens.css`, initialize shadcn, add a registry, or add a visual redesign.

## Spacing Scale

| Token | Value | Usage |
| --- | --- | --- |
| xs | 4px | Inline label, icon and count gaps |
| sm | 8px | Compact filter and status-control gaps |
| md | 16px | Summary-card inset, result-row spacing and default section gap |
| lg | 24px | Separation between overview, actionable cases and closed details |
| xl | 32px | Existing major layout separation only |
| 2xl | 48px | Existing major page break only |
| 3xl | 64px | Existing page-level spacing only |

Exceptions: retain the inherited responsive `--r-row-pad` and give every interactive control a minimum 44px touch/gamepad target. At 320px, filters, actions and pagination stack in DOM order with no horizontal page scroll.

## Typography

New phase text uses exactly four existing sizes and two weights. Existing surrounding typography remains unchanged.

| Role | Size | Weight | Line Height |
| --- | --- | --- |
| Secondary filter help, relative path and pagination context | 11.5px | 400 | 1.4 |
| Body, counters, result metadata and error remediation | 13px | 400 | 1.4 |
| Result name, filter label and compact status label | 14.5px | 500 | 1.4 |
| Operation and section heading | 17px | 500 | 1.1 |

Long localized copy wraps rather than shrinking. Counts always carry their unit and are readable at 200% zoom.

## Color

The 60/30/10 split describes emphasis within the existing dual-theme system, not a new palette.

| Role | Value | Usage |
| --- | --- | --- |
| Dominant (60%) | `--r-color-bg` | Page background and unselected result space |
| Secondary (30%) | `--r-color-surface`, `--r-color-bg-elevated`, `--r-color-border` | Compact summary card, actionable-case block, closed details and row separators |
| Accent (10%) | `--r-color-brand-primary` | Progress bar, primary scan action, selected filter state, active page and keyboard/gamepad focus treatment |
| Destructive | Existing semantic danger tokens and alert tone | Failed operation and failed result only, always with text and icon |

Accent is reserved for the listed controls and never paints whole result rows or ordinary labels. Use existing info/warning semantic tones for incomplete inventory, unidentified games and recoverable warnings. Unknown identification is actionable but is not a failed scan. Every color-coded state has localized text and an existing icon or label.

## Information hierarchy and copywriting

The status panel remains the visual anchor. During a scan it orders content as: localized operation state, progress, trustworthy current platform, scan total, Windows file-inventory check, actionable cases, then closed details. Once complete it replaces live emphasis with one compact final summary before any individual result.

| Element | Contractual localized copy, German examples |
| --- | --- |
| Running state | `Scan läuft` with `{checked} von {total} Spielen geprüft` only when both values are authoritative. Unknown totals use an indeterminate bar and `Fortschritt wird vom Server aktualisiert`, never an invented percentage. |
| Current platform | `Aktuelle Plattform: {platform}` only when the current snapshot explicitly identifies an active platform for its current attempt. Omit the field when absent, stale, completed or uncertain. |
| Scan total | `Scan insgesamt: {total} Spiele` labels operation game count, not files, requests or matched games. |
| Windows inventory | `Windows-Dateibestand: {checked} geprüft` and its existing localized outcome labels. It is visually and semantically separate from the scan total. Omit unavailable fields rather than showing zero or English fallback text. |
| Completed heading | `Scan abgeschlossen` or `Scan mit Hinweisen abgeschlossen`, followed by compact count summary, not a result list. |
| Actionable heading | `Handlungsbedarf ({count})`. Show at most three representative entries and one `Alle {count} Fälle anzeigen` control that opens details with the matching outcome filter. |
| Details disclosure | `Alle Ergebnisse` is collapsed by default. Its closed state does not request operation result rows. |
| Details CTA | `Ergebnisse anzeigen` opens the disclosure and fetches page one for the current operation/query/filter state. |
| Empty details | `Keine Ergebnisse für diese Auswahl` with `Suche oder Filter anpassen.` |
| Loading details | `Ergebnisse werden geladen` through existing inline loading state, without clearing the previous bounded page until the replacement page arrives. |
| Error details | `Ergebnisse konnten nicht geladen werden. Verbindung prüfen und erneut versuchen.` with `Erneut versuchen`. |
| No active operation | Keep the existing `Bereit zum Scannen` idle guidance; do not manufacture an operation summary. |

All new or changed visible strings, accessible names, plural forms and error remediation must be real translations in all 18 locales. Use `scan` namespace keys, preserve placeholder names, and eliminate English fallback strings and ambiguous raw states from this surface. There is no destructive action in this phase and no confirmation dialog is added.

## Component and ownership contract

| Owner | Required responsibility |
| --- | --- |
| `Scan.vue` | Preserve scan form, settings, permissions and live platform log. Compose focused result-overview feature components rather than extending this large view with result-query state. |
| `OperationStatusPanel.vue` | Keep authoritative operation heading, recovery actions and progress anchor. Render the compact running/completed overview and host an extracted results disclosure. |
| New focused Scan feature composites/composables | Map trustworthy snapshot facts to display facts, own URL query synchronization and request one result page at a time. Keep each production file under 500 logical lines. |
| `useScanOperationStatus` and `scanOperations` adapter | Preserve attempt/version/session ordering and extend the typed server-authoritative status request for page, search, platform and outcome filters. Replace the current accumulated-item projection for explorer navigation with the current page only. |
| `InventoryStatusSummary` and `InventoryStatusDetail` | Reuse or refactor into the compact summary/actionable sample presentation. They must not render the whole returned page by default. |
| Existing `ZA*` primitives | Reuse existing button, alert, checkbox/select/text input, progress, disclosure and pagination primitives. Do not introduce raw Vuetify controls where a primitive exists. |

The details explorer has these invariant controls:

| Control | Behavior |
| --- | --- |
| Name search | Debounced server-side query by game name. It applies to the entire operation, resets to page one, is URL-backed and never filters only browser-resident rows. |
| Platform filter | Server-side platform selection over the whole operation. It is URL-backed, resets to page one and combines with search and outcome. |
| Result filter | Server-side outcome selection, including the actionable outcome used by the summary link. It is URL-backed, resets to page one and combines with search and platform. |
| Pagination | Use the existing pagination UI and a fixed 50-result page. Show the server total and current page context. Previous/next and direct page navigation request exactly that page; after a successful navigation, replace the visible result array rather than appending pages. |
| Close details | Returns to compact summary and releases the rendered page. Reopening requests page one for the current URL query state. |

The server response must contain the complete-operation matching total plus enough safe item fields to render a name, platform, outcome and existing detail facts. It must not expose host paths, raw provider exceptions, or stale prior-attempt rows. The browser must hold no more than one displayed results page, three actionable examples and the compact server summary. A 1,000-game completed operation therefore never preloads or leaves an open mass list.

## State, accessibility and responsive contract

Only show progress ratio and current platform from the current authoritative operation attempt. Socket reconnect, a stale page response, an older version or an uncertain snapshot cannot overwrite a newer summary, active filters or page. The existing connection-lost and reconciliation language remains visible while retaining the last confirmed compact summary.

Use a polite, non-atomic live region for concise state/progress changes. Do not announce each count tick, row, example or page replacement. Announce the completed state and actionable total once. Actionable errors retain `role="alert"`; warnings do not repeatedly interrupt assistive technology.

`Alle Ergebnisse` is a real labelled disclosure with `aria-expanded`; opening it moves focus to its heading, while closing restores focus to the trigger. Native DOM order serves linear filters and pagination. Enter/Space activate controls, existing gamepad keyboard translation follows the same path, and existing key/pad-only focus rings remain. No hover-only affordance, tooltip-only status, or raw operation enum reaches the user.

At `xs` and `sm`, stack summary metrics, filters and pagination actions. Keep search full-width, use normal document flow for filters, and allow result names/relative paths to wrap. Do not rely on CSS media queries: use `useBreakpoint` and `html[data-bp]` conventions. At wide widths, retain the existing `/scan` composition and give the explorer a bounded content width inside the status panel. Validate 320, 600, 960, 1280 and 1920px in both themes.

## Registry Safety

| Registry | Blocks Used | Safety Gate |
| --- | --- | --- |
| Existing repository `ZA*` primitives | Existing controls and pagination only | Repository-owned, no registry install |
| shadcn official | None | Not applicable |
| Third-party registries | None | Not applicable |

## Verification Handoff

Before human UAT, do not add tests, modify tests, run test suites or weaken checks. The required evidence is a passing frontend typecheck and production build, then hands-on browser inspection using synthetic running and completed 1,000-game operation data.

Browser inspection must prove: trustworthy running progress/current platform; distinct scan-total and Windows-inventory labels; compact completion; no open or preloaded mass list; actionable count plus at most three examples; the actionable-details entry; remote search finding a game beyond page one; combined search/platform/outcome filters; page replacement rather than accumulated rows; and the same controls at desktop and mobile widths. Existing scan execution and settings must remain usable unchanged.

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
