---
quick_id: 261106-hgc
status: passed
verified: 2026-11-06
---

# Technische Verifikation – Main-Covervorschau

| Behauptung | Nachweis | Ergebnis |
| --- | --- | --- |
| Das vorhandene Main-Cover bleibt eine bestehende Quelle. | API-/Browserdiagnose: derselbe Legacy-Pfad liefert unverändert HTTP 200, `image/png` und 881050 Bytes. | Bestanden |
| Die Karte zeigt das Bild beim ersten Medieneinstieg. | Nach `eager`-Ladestrategie meldete das echte Bild 600×900 natürliche Pixel und war in Desktop/Mobil sichtbar. | Bestanden |
| DLC und Navigation regressieren nicht. | Authentifizierter Browser klickte die produktiven Main-/DLC-Medienreiter und zehn Galerievorschauen bei 1440 px und 390 px. | Bestanden |

Keine Testsuite und keine neuen Tests vor der Live-UAT.
