# Phase 42 pre-UAT inspection record

**Recorded:** 2026-11-10

## Intended inspection routes and stories

- Live settings route: `http://127.0.0.1:3000/user-interface`
- Live ROM overview route: `http://127.0.0.1:3000/rom/<authorized-rom-id>?tab=overview`
- Storybook start: `http://127.0.0.1:6006/`
- `Formulare/Einstellungen/SettingsToggleRow/Ähnliche Spiele ausserhalb der Bibliothek`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/An: gemischte Empfehlungen`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: nur Bibliothekstreffer`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Treffer nach Position sieben`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Auflösung läuft`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: keine Bibliothekstreffer`
- `Im Einsatz/Spieldetails/Ähnliche Spiele/Aus: Lookup-Fehler`

The setting story uses the real `SettingsSection` and `SettingsToggleRow` in
the production toggle-grid context. The six Similar-games stories use the real
`OverviewTab`, `RelatedGamesGrid`, and `RelatedGameCard` composition with
deterministic resolver-shaped data. Their source start paths are
`frontend/src/v2/components/Settings/SettingsToggleRow.stories.ts` and
`frontend/src/v2/components/GameDetails/RelatedGamesGrid.stories.ts`.

## Automated receipts

| Check | Result | Receipt |
| --- | --- | --- |
| `cd frontend && npm run typecheck` | Blocked | `RelatedGamesGrid.stories.ts:37` casts an incomplete `storyRom` fixture to `DetailedRom`; vue-tsc reports the missing generated schema fields. No source file was changed by this plan. |
| `cd frontend && npm run build` | Blocked | Vite transformed 3921 modules, then `vite-plugin-pwa` / Workbox failed because neither precaching nor runtime caching matched a configuration. No source file was changed by this plan. |
| `cd frontend && python3 src/locales/check_i18n_locales.py` | Passed | All 17 locale directories are complete. |
| `cd frontend && python3 src/locales/check_i18n_sorted.py` | Passed | All locale files are alphabetically sorted. |
| `cd frontend && npm run storybook:catalog` | Blocked, unowned | The catalog stops at `src/v2/components/GameDetails/MediaManagement.stories.ts` with unreviewed language-ledger entries beginning at lines 16 and 65. This reproduces the unrelated ledger drift recorded by Plan 42-05. |
| `cd frontend && CACHE_DIR="$TMPDIR/storybook-42-06.*" npm run storybook -- --smoke-test` | Passed with host warning | Storybook reported `Smoke tests passed, exiting.` It could not save its global settings and runtime registry under read-only `/home/d1sk/.storybook`; no project change was made. The explicitly created temporary cache was removed after the check. |

No test suite, Playwright run, snapshot comparison, or new test was created or
run.

## Browser and visual inspection

On 2026-11-10, the configured test account was authenticated in the same
headless Playwright context through the regular API session path and verified
with `/api/users/me` before opening the real settings and game-overview pages.
At 1440 px and 390 px, the saved preference toggled `true -> false -> true`
using pointer, Space and Enter. The settings and related-games section had no
console errors or failed network requests in the renewed run.

The Storybook iframe rendered each required real composition at both widths:

- the `SettingsToggleRow` composition exposed the label, help text and keyboard
  state change;
- the enabled fixture showed six ordered cards, including local and external
  targets;
- disabled fixtures showed two local cards, one promoted late local card, one
  confirmed local card while resolution was pending, no section for no matches,
  and one confirmed local card when another lookup failed.

The normal login-form submission remained on its login page despite an HTTP
200 `/api/login` response. The authenticated API-session fallback was valid for
the inspection; this separate form-flow observation remains for live UAT.

## Screenshots

The job-level sight-inspection receipt lists the desktop and mobile live-page
captures plus the fourteen Storybook captures, including every story start path
and result.

## Limitations

- The normal login-form redirect/session handoff needs separate investigation;
  it did not prevent the authenticated page inspection.
- The live data did not supply every deterministic Storybook edge case, so the
  mixed, late-match, pending, empty and error cases were demonstrated in their
  real-component Storybook compositions.
