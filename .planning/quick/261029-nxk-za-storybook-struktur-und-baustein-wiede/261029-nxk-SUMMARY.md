---
status: incomplete
quick_task: 261029-nxk
---

# ZA Storybook-Struktur und Baustein-Wiederverwendung

## Umsetzung

- Native Close-Steuerelemente in RDialog, RDrawer und RAlert nutzen RBtn; die
  Dialog- und Drawer-Abschnittstrenner nutzen RDivider.
- Der v2-Maintainability-Check prüft native Controls mit eng dokumentierten
  Ausnahmen.
- Storybook besitzt die deutsche Taxonomie, ein Kompositionsinventar sowie
  „Im Einsatz“-Seiten für Dialog, Drawer, Formularfehler und Alerts.

## Verifikation

- `npm run v2:maintainability` passed.
- `npm run typecheck` passed.
- `npm run test -- --run test/storybook.test.ts scripts/check-storybook-catalog.test.ts test/storybook-catalog.test.ts` passed, 371 tests.
- `npm run storybook:build` could not run because the pre-existing
  `frontend/node_modules` directory is owned by `nobody:nogroup` and Storybook
  cannot create its cache directory.

## Bekannte Einschränkungen

- The Storybook build and emitted-index validation remain blocked by the local
  node_modules permissions. No dependency files or permissions were changed.

## UAT-Hinweise

- Start Storybook at `http://localhost:6006` and inspect
  `Overlays/Zusammengesetzt/RDialog`, `Overlays/Zusammengesetzt/RDrawer`, and
  `Grundelemente/Zusammengesetzt/RAlert` for close controls and separators.
- Inspect `Im Einsatz/Seitenkontexte` for Dialog auf einer Seite, Drawer auf
  einer Seite, Formular mit Fehlerzuständen, and Alert-Varianten auf einer
  Seite.
- Confirm `Marke/ZA-Hintergrund/Glasreflexion B` remains unchanged in both
  themes and with reduced motion.
