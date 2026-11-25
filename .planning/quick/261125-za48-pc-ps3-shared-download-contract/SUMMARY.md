---
id: 261125-za48
title: PC- und PS3-Bestandsvertrag im gemeinsamen Shared-Downloader erhalten
status: completed
commits:
  - 26148a6f1
  - caa5f6b2f
---

# Quick Summary: PC- und PS3-Bestandsvertrag

## Umsetzung

- Der gemeinsame Capability-Pfad behandelt PC und PS3 wieder als bestehende
  sichere Shared-Download-Verträge. Die 4-GB-Regel (einschließlich exakt
  4.000.000.000 Byte) gilt nur für zusätzliche Plattformen mit bekannter
  Gesamtgröße.
- PS3 kann eine fehlende historische neutrale Inventur erst nach den
  bestehenden Sichtbarkeits- und Berechtigungsprüfungen beim Manifestzugriff
  materialisieren. Scan-Reconciliation unterscheidet nun explizit
  `ScanType.QUICK` vom Windows-spezifischen Quick-Kontext; kleine zusätzliche
  Konsolen lösen keine Inventur oder SHA-256-Berechnung aus.
- Dokumentiert in `docs/BACKEND_ARCHITECTURE.md` und
  `docs/FRONTEND_ARCHITECTURE.md`.
- Die Browser-UAT fand noch technische Leerhinweise bei fehlender Beschreibung
  in zwei normalen Detailansichten. Diese sind entfernt; der ausdrücklich
  geöffnete `LocalizedDescriptionEditor` bleibt unverändert.

## Verifikation

- `trunk check` für die geänderten Vue-Dateien: grün.
- `npm run typecheck` und `npm run build`: grün. Der Build meldet nur bekannte
  Hinweise zu `:deep`, Chunk-Größen und einer Drittanbieter-`eval`-Stelle.
- Keine Tests erstellt, geändert oder ausgeführt.

## Isolierte Browser-UAT

- Wegwerfbarer lokaler Stack mit synthetischem Testkonto und Fixtures; keine
  Dev-/Produktdaten, NAS-Daten oder bestehenden Rechte verändert. API und Vite
  liefen innerhalb des Runner-Netzes auf `http://127.0.0.1:3344` bzw.
  `http://127.0.0.1:3345`; nach dem Lauf wurden Container, Netzwerk und Image
  bereinigt.
- Desktop `1440x960` und Mobil `390x844`: deutsche Beschreibung, englische
  Fallback-Beschreibung und fehlende Beschreibung ohne technischen Hinweis
  geprüft.
- Zusätzliche NES-Fixtures: bei `3.999.999.999` Bytes kein Shared-Tab;
  bei `4.000.000.000` und `4.000.000.001` Bytes Shared-Tab, Dialog und Abbruch
  geprüft. PC und PS3 mit kleinen bestehenden FOLDER-Komponenten blieben
  erreichbar und öffneten ebenfalls den gemeinsamen Dialog; ein Start wurde
  nicht ausgelöst.
- Belege (Screenshots, Antwortauszüge und Beobachtungen) bleiben für die
  Abnahme unter `/tmp/za-261124-hds-browser/isolated/browser-proof`; die
  Ressource ist als `path za-261124-hds-browser/isolated` in
  `/tmp/ki-uat-keep.txt` registriert.

## Abweichungen

- Ein erster Lauf mit 3.076 synthetischen PS3-Dateien traf die vorhandene
  Inventarfrist der VM. Gemäß Auftragsregel wurde weder Produktcode noch ein
  Zeitbudget verändert. Die gleiche Benutzerstrecke wurde anschließend mit
  kleiner synthetischer Fixture erfolgreich geprüft.

