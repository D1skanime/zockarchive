---
quick_id: 261106-gp5
status: complete
completed: 2026-11-06
---

# Animierte Provider-Cover als persistente Kandidaten erhalten – Abschluss

## Umsetzung

- Der Parent-Providerkatalog führt `url_cover` als Rolle `cover` statt `artwork`; Steam-Adapter und Scan-Suppression verwenden dieselbe Rolle.
- Der DLC-Provider-Speicher akzeptiert validierte `image/gif`-Dateien und bewahrt wie bei WebP die unveränderten Quelldaten. Mehrere Provider-Cover ersetzen einander nicht mehr.
- Ein explizites Refresh meldet einen fehlgeschlagenen Providerdownload als Konflikt statt einen erfolgreichen Katalog vorzutäuschen.

## Gezielte Verifikation

- `trunk fmt` für die sieben geänderten Dateien und `git diff --check` waren erfolgreich. Keine Testsuite und keine neuen Testdateien wurden vor der erneuten Live-UAT ausgeführt.
- Eine isolierte synthetische Main-ROM- und DLC-Komponente erhielt GIF- und WebP-Cover über die produktiven Upload- und Provider-Persistenzpfade. Im authentifizierten Browser wurden die Kandidaten im Cover-Reiter und in der Galerie an Desktop und Mobil geöffnet, ausgewählt und nach Reload erneut abgerufen.
- Der Browser dekodierte die echten Content-Endpunkte mit `ImageDecoder`: beide Formate hatten jeweils zwei unterschiedliche Frames für Main und DLC. Screenshots liegen im Job-Evidenzordner unter `screens/quick-261106-gp5-*`.
- Sämtliche hierfür angelegten synthetischen ROM-, DLC- und Mediendaten sowie ihre elf Owned-Dateien wurden wieder entfernt. Reale Bibliotheksdaten und die Referenzspiele blieben unverändert.

## Einschränkungen

Die Browser-Konsole meldet beim Laden der Login-Seite den erwarteten unauthentifizierten Startabruf sowie vorhandene 404s für die dateilose synthetische ROM. Nach der Anmeldung gab es keine fehlgeschlagenen Browser-Netzwerkanfragen für die Cover-Content-Endpunkte.
