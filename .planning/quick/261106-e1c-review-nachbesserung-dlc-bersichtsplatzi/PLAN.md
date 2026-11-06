---
quick_id: 261106-e1c
title: Review-Nachbesserung für DLC-Übersichtsplatzierungen
status: in_progress
parent_phase: 40
---

# Review-Nachbesserung für DLC-Übersichtsplatzierungen

## Befund und Scope-Prüfung

Der Review-Befund zur Vermischung von Hintergrund- und Übersichtsbildern ist gültig:
`PcDlcDetail.vue` wertete bislang jede positive Platzierung aus. Die Übersicht darf nur
Platzierungen mit `surface: "overview"` anzeigen; Hintergrund- und Übersichtsreihenfolge
bleiben damit unabhängig.

Der Befund, dass ein eigener DLC-Handbuch- und Soundtrack-Reiter fehle, wird nicht
implementiert. Die spätere, verbindliche Menschenentscheidung für diesen Auftrag lautet,
dass DLCs und Expansions keinen eigenen Soundtrack, Hintergrund oder Handbuch besitzen;
Soundtrack und Handbuch verbleiben beim Hauptspiel. Die absichtlich begrenzte Navigation
in `pcDlcMediaPresentation.ts` entspricht diesem neueren Scope und wird nicht als
unbegründete Lücke behandelt.

## Umsetzung

1. DLC-Übersichtsableitung auf `placement.surface === "overview"` begrenzen.
2. Den realen DLC-Übersichtsweg im angemeldeten Browser auf Desktop und Mobil öffnen und
   die sichtbare Übersicht sowie Mediennavigation ohne Mutation prüfen.
3. Kein Test und keine Suite: Die aktuelle UAT-Regel verbietet beides vor Freigabe.

## Akzeptanz

- Eine Hintergrundplatzierung erscheint nicht mehr als DLC-Übersichtsbild.
- Übersichtsbilder behalten ihre Reihenfolge und die Übersicht bleibt bedienbar.
- Kein eigener DLC-Handbuch-/Soundtrack-Reiter wird entgegen der späteren Scope-Entscheidung
  eingeführt.
