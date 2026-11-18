---
quick_id: 261118-lfr
title: PC-Einzelmitglied-Download diagnostizieren und reparieren
status: in_progress
wave: 1
depends_on: []
---

# PC-Einzelmitglied-Download diagnostizieren und reparieren

## Ziel

Den regulären Download eines einzelnen gescannten PC-Mitglieds mit isolierten
Testdaten nachvollziehen, die tatsächliche Ablehnungsursache ohne Preisgabe
nicht sichtbarer Ressourcen kenntlich machen und den Browserablauf auf Desktop
und Mobil prüfen.

## Aufgaben

1. Einen isolierten PC-ROM mit einem einzelnen MP3-Manifestmitglied erstellen,
   Request-IDs und die serverseitige Manifest-Erzeugung nachvollziehen.
2. Den belegten Bruch zwischen auswählbaren Mitgliedern, zulässigen
   Komponenten und der Manifest-API korrigieren. Sichtbarkeits- und
   Berechtigungsprüfungen sowie die generische 404-Antwort für nicht sichtbare
   ROMs bleiben unverändert.
3. Die Ursache und den korrigierten regulären Download im Browser bei 1440 px
   und 390 px durchklicken, Screenshots und Sichtprüfungsbericht ablegen.

## Verifikation

Vor Live-UAT keine Testsuite und keine neuen Tests. Der Nachweis erfolgt mit
isolierten Testdaten, dem laufenden HTTP-Programm, Browserkonsole und
Netzwerkantworten. Typecheck oder Build werden nur ausgeführt, falls sie für
die geänderte Oberfläche erforderlich sind.
