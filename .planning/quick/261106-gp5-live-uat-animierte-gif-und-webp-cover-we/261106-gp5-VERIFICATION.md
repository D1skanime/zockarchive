---
quick_id: 261106-gp5
status: passed
verified: 2026-11-06
---

# Technische Verifikation – animierte Cover

| Behauptung | Nachweis | Ergebnis |
| --- | --- | --- |
| Provider-/Scraper-Cover erscheinen als Coverkandidaten. | Parent-Provider, Steam-Inventar und Scan-Suppression übergeben `url_covers` mit der Rolle `cover`; DLC-Providerimporte bewahren mehrere Cover. | Bestanden |
| GIF und WebP behalten die Animation. | Produktive Content-Endpunkte lieferten Browser-`ImageDecoder` jeweils zwei unterschiedliche Frames für GIF und WebP bei Main und DLC. | Bestanden |
| Kandidaten bleiben bedienbar. | Authentifizierter Browser öffnete Karten und Galerie, wählte den letzten Providerkandidaten und bestätigte die Auswahl nach Reload für Main und DLC bei 1440 px und 390 px. | Bestanden |
| Sicherheitsgrenzen bleiben erhalten. | Vorhandene 10-MiB-Grenze, Pillow-Validierung und MIME-Allowlist wurden beibehalten; nur `image/gif` wurde im bereits bildvalidierenden DLC-Provider-Speicher ergänzt. | Bestanden |

Keine vollständige Regression und keine Testsuite vor der menschlichen UAT-Freigabe.
