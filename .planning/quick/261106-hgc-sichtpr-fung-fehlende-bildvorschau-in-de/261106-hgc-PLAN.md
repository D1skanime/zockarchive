---
quick_id: 261106-hgc
title: Bestehende Hauptspiel-Covervorschau sichtbar laden
status: in_progress
created: 2026-11-06
---

# Quick Task: Hauptspiel-Covervorschau

## Befund

Die echte Hauptspielseite `/rom/24?tab=media` liefert das vorhandene Legacy-Cover
mit HTTP 200 und 881050 Bytes als PNG aus, doch das `loading="lazy"`-Bild bleibt
nach fünf Sekunden mit `naturalWidth=0` unvollständig. Die gleiche Karte beim DLC
ist sichtbar. Der Befund betrifft deshalb nicht die Datenquelle, sondern die
sichtbare, in der Hauptspiel-Medienseite dauerhaft vorgemountete Karte.

## Umsetzung

1. Die gemeinsame Medienkarte erhält eine explizite Ladestrategie.
2. Die Coververwaltung fordert für ihre sofort sichtbaren Vorschauen `eager` an;
   andere Mediengalerien behalten Lazy Loading.
3. Die echte Hauptspiel- und DLC-Coveransicht wird danach in Desktop und Mobil
   nochmals ohne Mutation geprüft.

## Verifikation

Keine Testsuite und keine neuen Tests vor der Live-UAT. Es werden nur
Sichtprüfung, Browser-Netzwerk-/Konsolenbeobachtung und statische Diff-/Formatprüfung
ausgeführt.
