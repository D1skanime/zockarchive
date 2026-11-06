---
quick_id: 261106-hgc
status: complete
completed: 2026-11-06
---

# Bestehende Hauptspiel-Covervorschau sichtbar laden – Abschluss

## Umsetzung

Die gemeinsame `MediaManagementCard` akzeptiert nun eine explizite
Ladestrategie. Die produktive Coververwaltung nutzt `eager`, während
Screenshots und Artwork weiter Lazy Loading verwenden. Das verhindert, dass
die bereits gemountete, beim Wechsel in Medien sichtbar werdende Main-Coverkarte
bei nativer Lazy-Loading-Entscheidung leer bleibt.

## Gezielte Verifikation

- Das echte Main-Cover von `/rom/24?tab=media` war vor der Korrektur über den
  bestehenden Pfad mit HTTP 200, PNG-MIME und 881050 Bytes erreichbar, blieb
  aber nach fünf Sekunden bei `naturalWidth=0`.
- Danach war es im authentifizierten Browser vollständig geladen (600×900) und
  in Desktop- und Mobilansicht sichtbar. Die DLC-Coververwaltung wurde auf
  beiden Breiten erneut mit Reitern und Galerie geprüft.
- `trunk fmt` für die beiden geänderten Vue-Dateien und `git diff --check`
  waren erfolgreich. Auf Anweisung wurden keine Tests geschrieben oder
  Testsuiten ausgeführt.
