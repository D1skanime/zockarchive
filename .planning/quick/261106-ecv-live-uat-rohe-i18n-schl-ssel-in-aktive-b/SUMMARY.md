---
quick_id: 261106-ecv
status: complete
parent_phase: 40
commit: recorded in Git history
---

# Zusammenfassung: Lokalisierung der aktiven Medienverwaltungen

## Ergebnis

- `common.move-up` und `common.move-down` sind vollständig in allen 18
  Locale-Katalogen vorhanden. Im deutschen UI heißen die Aktionen „Nach oben“ und
  „Nach unten“.
- Die beiden zugehörigen Reiter-Schlüssel `active-backgrounds` und
  `active-overview-images` wurden in den bisher fehlenden 16 `rom.json`-Katalogen
  ergänzt. Damit ist die neue gemeinsame Verwaltung auch außerhalb von DE/EN-US
  vollständig lokalisiert.
- Die gemeinsame `ActiveMediaPlacementManager`-Komponente verwendet die übersetzten
  Werte gleichermaßen für sichtbare Aktion, Tooltip und aria-Label.

## Verifikation

- `check_i18n_locales.py` und `check_i18n_sorted.py`: beide erfolgreich.
- Echter Browser, DE-UI: Hauptspiel und DLC, jeweils „Aktive Hintergründe“ und
  „Aktive Übersichtsbilder“, auf 1440 px und 390 px angeklickt. Kein sichtbarer
  `common.move-*`-Schlüssel; vorhandene Pfeilaktionen hatten die ARIA-Labels
  „Nach oben“ beziehungsweise „Nach unten“. Keine blockierenden Konsolen- oder
  Netzfehler nach Wiederholung des mobilen Laufs.

Keine Medien wurden verändert. Es wurden keine neuen Komponenten-Tests und keine
Testsuite gestartet, entsprechend der laufenden UAT-Vorgabe.
