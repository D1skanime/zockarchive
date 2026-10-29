---
status: complete
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
- Jede als `Zusammengesetzt` katalogisierte Story erhält ihre Beschreibung
  aus dem Inventar. Dadurch beginnen die Beschreibungen mit `Besteht aus:`
  und verlinken die Grundelemente über generierte Storybook-Dokumentationslinks.
- Der Katalog-Lint inventarisiert alle statischen sichtbaren Story-Texte nach
  Datei, Zeile und Kategorie. Die explizite Prüfliste trennt deutsche Freigaben
  von begründeten Eigennamen und lässt neue oder geänderte Texte nicht ohne
  Entscheidung passieren.

## Verifikation

- `npm run v2:maintainability` passed.
- `npm run typecheck` passed.
- `npm run test -- --run test/storybook.test.ts scripts/check-storybook-catalog.test.ts test/storybook-catalog.test.ts` passed, 371 tests.
- The catalog checker confirms every composed catalog entry carries its
  inventory declaration.
- Der Storybook-Build läuft erfolgreich im bestehenden Container mit
  `docker exec pgdp-dev sh -c 'cd /app/frontend && npx storybook build -o /tmp/storybook-static'`.
  Dies ist der dokumentierte Standardweg, weil er keine Berechtigungen oder Dateien
  in den root-eigenen Host-Abhängigkeiten verändert.
- `npx tsx scripts/check-storybook-catalog.ts` prüft 53 Story-Dateien mit
  1.558 Textkandidaten und meldet 0 offene Treffer. Die konkreten Eigennamen
  (Spieletitel, Plattformnamen und der Platzhaltername Jane Doe) stehen mit
  Geltungsbereich und Begründung in
  `frontend/scripts/storybook-language-decisions.json`.
- `npm run storybook:catalog` führt dieselbe Prüfung gegen den tatsächlichen
  Katalog aus und ist als eigener Schritt im Frontend-CI-Workflow verdrahtet.

## Bekannte Einschränkungen

- Der Host-Build bleibt wegen der vorhandenen Eigentümerschaft von `node_modules`
  ungeeignet. Der Container-Standardweg erzeugt seine Ausgabe nur temporär unter `/tmp`.

## UAT-Hinweise

- Start Storybook at `http://localhost:6006` and inspect
  `Overlays/Zusammengesetzt/RDialog`, `Overlays/Zusammengesetzt/RDrawer`, and
  `Grundelemente/Zusammengesetzt/RAlert` for close controls and separators.
- Inspect `Im Einsatz/Seitenkontexte` for Dialog auf einer Seite, Drawer auf
  einer Seite, Formular mit Fehlerzuständen, and Alert-Varianten auf einer
  Seite.
- Confirm `Marke/ZA-Hintergrund/Glasreflexion B` remains unchanged in both
  themes and with reduced motion.
