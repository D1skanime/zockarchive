---
quick_id: 261106-fgt
status: complete
parent_phase: 40
commit: recorded in Git history
---

# Zusammenfassung: Persistierte Coverauswahl

## Korrekturen

- Die Hauptspiel-Detailansicht übergibt kein Übersichtsbildergebnis mehr als
  `cover-src`. Die sichtbare Coverfläche folgt wieder ausschließlich der
  persistierten Coverquelle und damit einer expliziten Auswahl.
- Der PC-Metadaten-Import aktualisiert die erhaltene Provider-Originalquelle nur,
  solange kein owned Cover aktiv ist. Ein frisches Provider-Cover bleibt dadurch im
  Cover-Katalog sichtbar, ohne eine manuelle Auswahl zu überschreiben.

## Gezielte Nachweise

- Browser-Mock mit Cover A und Overview B: Der Hero zeigte A vor und nach Reload;
  B wurde nie als Cover-URL verwendet.
- Browser-Mock mit Providerquelle und manuellem Kandidaten: beide waren sichtbar und
  die Vorschau-Galerie öffnete sich.
- Echte, nur gelesene Hauptspiel- und DLC-Cover: auf Desktop und Mobil geladen;
  Galerie geöffnet und lokalisiert geschlossen.

Es wurden keine realen Cover, Medien oder Platzierungen verändert und keine Testsuite
gestartet.
