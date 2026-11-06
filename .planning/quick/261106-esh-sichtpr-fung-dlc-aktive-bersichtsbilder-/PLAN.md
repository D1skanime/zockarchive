---
quick_id: 261106-esh
title: Sichtprüfung der DLC-Übersichtsbilder
status: complete
parent_phase: 40
---

# Sichtprüfung der DLC-Übersichtsbilder

## Anlass

Die Vollseitenaufnahme der mobilen DLC-Verwaltung zeigte zunächst leere Bildflächen.
Das war als potenzieller 403-Auslieferungsfehler zu prüfen.

## Prüfung

1. Die echte angemeldete Seite `/rom/24/dlc/20?tab=media` auf 390 px öffnen.
2. „Aktive Übersichtsbilder“ aktivieren, die Karten in den Viewport scrollen und
   natürliche Bildgröße sowie HTTP-Antworten der produktiven Content-Endpunkte prüfen.
3. Alle DLC-Medienreiter auf Desktop und Mobil per tatsächlichem Klick aktivieren.

## Ergebnis

Kein Produktfehler: Die sieben sichtbaren Übersichtsbilder laden nach dem Scrollen mit
HTTP 200 und natürlicher Breite 1280 px. Die zunächst leere Vollseitenaufnahme war die
korrekte Auswirkung von `loading="lazy"` auf nicht sichtbare Bilder. Es ist keine
Implementierungsänderung erforderlich.
