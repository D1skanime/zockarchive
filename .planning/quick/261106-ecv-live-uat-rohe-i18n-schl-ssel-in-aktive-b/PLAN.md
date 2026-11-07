---
quick_id: 261106-ecv
title: Lokalisierung der aktiven Medienverwaltungen
status: in_progress
parent_phase: 40
---

# Lokalisierung der aktiven Medienverwaltungen

## Befund

`ActiveMediaPlacementManager` verwendet für die Pfeilaktionen `common.move-up` und
`common.move-down`. Beide Schlüssel fehlen in den Locale-Katalogen und werden deshalb
im ausgelieferten DE-UI roh angezeigt. Die gemeinsame Komponente versorgt sowohl
„Aktive Hintergründe“ als auch „Aktive Übersichtsbilder“ für Hauptspiel und DLC.

## Umsetzung

1. Die beiden generischen Bewegungsaktionen vollständig in allen Locale-Katalogen
   ergänzen, mit „Nach oben“ und „Nach unten“ für Deutsch sowie passenden EN-Texten.
2. Die gemeinsame Verwaltung unverändert weiterverwenden, damit Titel, Tooltips und
   aria-Labels denselben lokalisierten Text erhalten.
3. Gezielt die Locale-Parität prüfen und im echten Browser Main/DLC sowie beide
   Verwaltungsreiter auf Desktop und Mobil anklicken. Keine Medien mutieren.

## Akzeptanz

- Kein sichtbarer `common.*`-Schlüssel in den beiden aktiven Medienverwaltungen.
- Auf-/Ab-Aktionen zeigen deutsche Beschriftungen, Tooltips und ARIA-Labels.
- DE/EN-Schlüssel sind in allen Katalogen vollständig und sortiert.
