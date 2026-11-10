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

Both existing endpoints answered HTTP 200 on 2026-11-10:
`http://127.0.0.1:6006/` and `http://127.0.0.1:3000/`. No graphical browser
process or browser-control capability was available in this execution
environment. Persistent Docker stacks were not started, restarted, or altered.
Consequently, no direct visual inspection, pointer interaction, keyboard
interaction, authenticated account switch, hard reload, delayed-response
exercise, local-card navigation, or screenshot capture was performed.

The following required checks remain for live UAT in an available browser, at
1440 px and 390 px in both themes:

- Inspect all seven listed stories. Confirm the no-match story has neither the
  Similar games heading nor a grid, the lookup-error story exposes no external
  fallback, and the late local match is visible after source position seven.
- On `/user-interface`, toggle the saved preference by pointer, Tab then
  Space, and Tab then Enter. Verify layout and focus at both widths.
- On an authorized `/rom/<id>?tab=overview`, verify enabled mixed cards,
  disabled local-only filtering before the six-card limit, local-card
  navigation, and section removal with no match.
- Save disabled, hard-reload, change games, then re-enable. Repeat with an
  account or isolated profile that has no stored value to confirm the default
  enabled state. While disabled, induce a delayed response from the previous
  game and confirm that it cannot mount an external card.

## Screenshots

None. The environment had no graphical browser capability, so no screenshot
path is claimed.

## Limitations

- Browser UAT and visual comparison at 1440 px and 390 px remain outstanding.
- Typecheck and production build are currently blocked by the exact unrelated
  issues recorded above.
- Storybook catalog validation remains blocked by the unowned MediaManagement
  language-ledger drift. The isolated Storybook smoke rendering passed.
