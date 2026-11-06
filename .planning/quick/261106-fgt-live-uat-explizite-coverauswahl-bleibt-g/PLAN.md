---
quick_id: 261106-fgt
title: Persistierte Coverauswahl von Übersichtsbildern trennen
status: in_progress
parent_phase: 40
---

# Persistierte Coverauswahl von Übersichtsbildern trennen

## Befund

Die Hauptspiel-Detailseite leitete das erste `overview`-Medium als `cover-src` an
`CoverColumn` weiter. Dieser explizite Override hatte Vorrang vor `path_cover_*` und
damit vor der in `active_owned_cover_media_id` materialisierten Coverauswahl. Die
Persistenz blieb korrekt, die tatsächliche Anzeige ignorierte sie.

Provider-Cover folgen zwei bewahrten Wegen: Hauptspiele führen die Originalquelle über
die persistenten `original_cover_*`-Felder, DLCs über provider-owned Cover-Medien. Die
Kandidatenansicht muss beide darstellen, ohne Übersichtsbilder einzumischen.

## Umsetzung

1. Den fehlerhaften Overview-Override aus der echten Hauptspiel-Coveranzeige entfernen.
2. Bestehende Provider-/Originalquellen und component-owned Provider-Cover im Response-
   und Kandidatenfluss prüfen, einschließlich getrennter Besitzer-IDs.
3. Mit synthetischen Browserdaten Cover A und Übersicht B sowie Provider-Cover rendern;
   Reload und Reihenfolgewechsel dürfen das Cover nicht ersetzen. Reale Daten bleiben
   lesend.

## Akzeptanz

- `active_owned_cover_media_id` und `path_cover_*` bestimmen die Hauptspielanzeige.
- Overview- und Background-Platzierungen überschreiben keine Coverauswahl.
- Provider-/Originalcover bleiben als Coverkandidaten erreichbar.
