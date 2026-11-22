---
quick_id: 261117-coq
title: Post-UAT-Tests für Scan-Snapshot und Integritätsabläufe
status: complete
---

# Ergebnis

Der Worker-Test parametrisiert die zwei dauerhaften Snapshot-Verträge direkt:

- Ein älterer Auftrag ohne `type` verwendet `quick`.
- Ein Auftrag mit explizitem `complete` übergibt genau diesen Typ an den
  Mixed-Scan-Einstieg.

In beiden Fällen bleibt die bei Annahme gespeicherte Metadaten-Sprache stabil.
Es wurden keine Produktdateien geändert.

## Verifikation

- MariaDB-Pytest-Shard 5: bestanden; enthält den neuen SQL-Worker-Test.
- MariaDB-Pytest-Shard 6: bestanden; enthält die bestehenden direkten
  Archiv-Weiterlauf- und Owned-Content-Proof-Prüfungen.
- Beide isolierten Läufe meldeten erfolgreichen Cleanup und unveränderte Quellen.
