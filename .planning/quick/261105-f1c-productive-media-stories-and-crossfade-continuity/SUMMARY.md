---
status: complete
---

# Quick 261105-f1c – Umsetzung

- Ersetzt die nachgezeichneten Medienseiten-Stories durch `MediaTab` und `PcDlcMediaTab` mit synthetischen Besitzern.
- Bindet Spielbild-Overlays pro Crossfade-Ebene und ergänzt die echte Fallback-Story.
- Macht die defekte Vorschau echt sichtbar und vereinheitlicht Hintergrundaktionen; DLC-Soundtracks sind nun sortierbar.

## Nachweise

- `npm run typecheck`, Storybook-Katalog und Storybook-Build mit temporärem Cache.
- Gezielte Frontend-Auswahl: 143 Tests in 17 Dateien.
- Isolierter MariaDB-Lauf für `test_pc_component_resources.py`: 7 Tests.
