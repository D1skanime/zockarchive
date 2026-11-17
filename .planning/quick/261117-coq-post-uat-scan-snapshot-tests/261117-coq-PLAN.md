---
quick_id: 261117-coq
title: Post-UAT-Tests für Scan-Snapshot und Integritätsabläufe
status: complete
wave: 1
depends_on: []
---

# Post-UAT-Tests für Scan-Snapshot und Integritätsabläufe

## Ziel

Die abgenommene Schnellscan-Logik direkt absichern, ohne Browser- oder
Snapshot-Tests: Ein älterer persistierter Auftrag ohne `type` muss als
Schnellscan laufen; ein explizit persistierter Scan-Typ muss unverändert
durchgereicht werden.

## Umsetzung

1. Den vorhandenen SQL-Worker-Test um beide Snapshot-Varianten erweitern.
2. Den zugehörigen MariaDB-Shard sowie den Shard mit Archiv-Weiterlauf und
   Owned-Content-Proof ausführen.
3. Ergebnisse in SUMMARY und STATE dokumentieren und atomar committen.
