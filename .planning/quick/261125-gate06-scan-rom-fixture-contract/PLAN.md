---
id: 261125-gate06-scan-rom-fixture-contract
title: Gate06-Scan-Testfixture an den persistierten ROM-Vertrag anpassen
status: planned
scope: test-and-planning-only
product_head: 30da371f3
---

# Quick Plan

## Befund und Ursache

Der produktive `Rom`-Vertrag stellt `has_simple_single_file` als Property aus
`multi_file` und `top_level_file_count` bereit. Der Scan ruft nach dem
persistierten Schreiben die gemeinsame Download-Reconciliation auf. Bei einer
Windows-ROM liest deren bestehende Policy diese Property.

Die beiden Gate06-Fehler verwenden für die durch
`db_rom_handler.add_rom` beziehungsweise `db_rom_handler.get_rom`
zurückgegebenen persistierten ROMs einen `SimpleNamespace`. Diese Doubles
haben `id` und `updated_at`, aber nicht den für den nun ausgeführten
persistierten-ROM-Vertrag erforderlichen Zustand `has_simple_single_file`.
Nach dem ersten fehlenden Property erreicht der Scan erwartungsgemäß die
separat getestete Inventur-Nebenwirkung. Daher brauchen die persistierten und
erneut geladenen Windows-Doubles auch `fs_path`, `fs_name` und `components`.
Die Steam-Metadaten-Tests besitzen absichtlich keine reale Quellendatei und
isolieren diese Nebenwirkung mit einem aufgerufenen `AsyncMock`. Das ist ein
unvollständiger Mock, nicht ein Produktfehler. Produktcode darf nicht mit
`getattr` oder einem Default abgeschwächt werden.

## Umsetzung

1. In `backend/tests/handler/test_scan_handler.py` ausschließlich die
   `SimpleNamespace`-Rückgaben in
   `test_steam_media_reconciliation_uses_the_persisted_rom_timestamp` und
   `test_steam_scan_defers_automation_until_the_final_scan_write` minimal
   vervollständigen. Jede Rückgabe, die den persistierten Windows-ROM an
   `scan_rom` und damit an die Scan-Reconciliation repräsentiert, erhält
   `has_simple_single_file=True`, `fs_path`, `fs_name` und `components`, passend
   zur einfachen `.exe`-Fixture. Die separat abgedeckte
   `reconcile_scanned_shared_download_inventory`-Nebenwirkung wird mit einem
   `AsyncMock` isoliert und ihr Aufruf mit persistierter ROM, Windows-Plattform,
   Autorisierungsflag und Storage-Argument explizit geprüft. Die bestehenden
   Assertions zu Zeitstempel, Medienabgleich, finalem Write und unterdrückter
   Automation bleiben unverändert. Keine Produktdatei, Produktions-Fallback,
   Assertion, Skip- oder Integritätsprüfung ändern.

2. Die beiden genannten Testfälle gezielt in der vorhandenen isolierten
   Phase34-MariaDB-Umgebung ausführen, nicht gegen SQLite und nicht als
   gesamte Backend-Suite:
   `uv run python backend/tools/phase34.py backend --dialect mariadb --timeout 300 tests/handler/test_scan_handler.py -k 'test_steam_media_reconciliation_uses_the_persisted_rom_timestamp or test_steam_scan_defers_automation_until_the_final_scan_write'`.
   Anschließend dieselbe direkt betroffene Datei in dieser MariaDB-Umgebung
   ausführen. Einen reinen Zeitlimit-Ausreißer höchstens einmal als genau
   diesen Lauf wiederholen und als VM-Last dokumentieren, ohne Test- oder
   Produktänderung.

3. `.planning/quick/261125-gate06-scan-rom-fixture-contract/SUMMARY.md`
   mit Ursache, der konkreten Fixture-Ergänzung, exakten gezielten Befehlen
   und Ergebnissen erstellen. `.planning/STATE.md` um die abgeschlossene
   Quick-Aufgabe ergänzen. Nur diese Testdatei und die beiden GSD-Artefakte
   committen; keine aufgelösten Umgebungswerte, temporären Runner-Logs oder
   Secrets aufnehmen.

## Direkt betroffene Dateien

- `backend/tests/handler/test_scan_handler.py`
- `.planning/quick/261125-gate06-scan-rom-fixture-contract/PLAN.md`
- `.planning/quick/261125-gate06-scan-rom-fixture-contract/SUMMARY.md`
- `.planning/STATE.md`

## Akzeptanzkriterien

- Beide zuvor fehlschlagenden Steam-Scan-Fälle erreichen ihre bestehenden
  Zeitstempel- und Automationsassertions ohne `AttributeError`.
- Die Testdoubles bilden den tatsächlich benötigten persistierten
  Windows-ROM-Property- und Inventur-Argumentvertrag explizit nach.
- Die Steam-Metadaten-Tests prüfen den Aufruf der separat abgedeckten
  Reconciliation, ohne eine nicht zu ihnen gehörende Quellendatei aufzubauen.
- `has_simple_single_file` bleibt eine strikte Modell-/Mock-Eigenschaft;
  es gibt weder `getattr` noch einen Default im Produktcode.
- Die gezielten zwei Fälle und danach die direkt betroffene
  `test_scan_handler.py` sind in der isolierten MariaDB-Phase34-Umgebung
  grün. Es wird keine Vollsuite gestartet.
