---
id: 261125-za48
title: PC- und PS3-Bestandsvertrag im gemeinsamen Shared-Downloader erhalten
status: completed
---

# Quick Plan

## Ausgangslage

Der Vergleich mit `main` zeigt eine Regression aus Phase 48: Der neue
plattformneutrale Capability-Prädikatpfad verlangt für alle Quellen eine
persistierte neutrale FOLDER-Inventur und eine Gesamtsumme von mindestens
4.000.000.000 Bytes. Damit verschwinden die bereits abgenommenen PC- und
PS3-Manifestpfade, insbesondere kleine PS3-Fixtures und PS3-Bestände ohne
Altinventur. In `main` war die PS3-Inventur nach Sichtbarkeitsprüfung im
Manifest-Endpunkt materialisierbar und der Scan-Hook war PS3-spezifisch.

Der Quick-Fix erhält diesen Vertrag innerhalb derselben Manifest-, Queue- und
Transportarchitektur. Die 4-GB-Erweiterung bleibt für zusätzliche Plattformen
erhalten. Es werden weder Berechtigungen noch Pfadgrenzen gelockert und keine
zweite Download-Engine eingeführt.

## Umsetzung

1. Einen kleinen gemeinsamen Plattform-Policy-Adapter an der bestehenden
   `shared_download_capability`-/Manifestgrenze einführen oder die vorhandene
   gemeinsame Policy entsprechend schärfen:
   - PC und PS3 behalten ihre vorherige, sichere Capability- und
     Manifest-Materialisierung, einschließlich kleiner vorhandener Fixtures
     und PS3-Bestände ohne persistierte Altinventur.
   - Weitere Plattformen erhalten die neue gemeinsame Whole-Source-Fähigkeit
     ausschließlich bei bekannter Gesamtgröße von mindestens
     `SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES` (einschließlich 4.000.000.000),
     wobei unbekannte Größe keine Schätzung und keine Freigabe erzeugt.
   - Die bestehende Sichtbarkeits-, Rollen-, ROM- und Manifest-Snapshotprüfung
     bleibt vor bzw. innerhalb der bisherigen autorisierten Pfade erhalten.
   - Betroffene Dateien gezielt auf
     `backend/endpoints/responses/folder_download.py`,
     `backend/endpoints/download_manifests.py` und
     `backend/handler/scan_folder_download.py` beschränken; ergänze nur den
     notwendigen Aufrufer in `backend/handler/scan_handler.py`.

2. Den Scan-Lebenszyklus an derselben Policy ausrichten:
   - PS3 behält die zuvor akzeptierte Reconciliation bzw. die autorisierte
     On-Demand-Materialisierung, statt durch die neue 4-GB-Regel unterdrückt
     zu werden.
   - Zusätzliche Konsolen bauen oder hashen unterhalb der Grenze keine neue
     FOLDER-Inventur. Die bekannte Größenprüfung muss vor der aufwendigen
     Inventur liegen.
   - `ScanType.QUICK` explizit von `current_windows_quick()` unterscheiden:
     Der Windows-spezifische Ausführungskontext ist kein allgemeiner
     Scan-Typ-Indikator und darf gewöhnliche Konsolen-Quick-Scans weder
     ungewollt inventarisieren noch den bestehenden PS3-Vertrag verfälschen.
   - Keine neue Vollinventur, Hash-Berechnung oder Datenmigration allein für
     die Tab-Anzeige; vorhandene Inventur- und Größenfakten wiederverwenden.

3. Architekturtexte und UAT-Hand-off aktualisieren:
   - `docs/BACKEND_ARCHITECTURE.md` und bei sichtbarem Contract auch
     `docs/FRONTEND_ARCHITECTURE.md` beschreiben die gemeinsame Policy:
     Bestandsschutz für PC/PS3, 4-GB-Qualifikation für zusätzliche Plattformen
     und die weiterhin gültigen Sicherheitsgrenzen.
   - Keine Tests erstellen, ändern oder ausführen und keine vollständige Suite
     starten. Führe nur Typecheck, gezielten Trunk-Check und Build aus, soweit
     sie für die geänderten Dateien anwendbar sind.
   - Starte die bereits autorisierte isolierte temporäre Harness mit einem
     Testkonto, ohne bestehende Dev-/Produktdaten, Rechte oder Passwörter zu
     ändern. Trage Ressourcen, die für die UAT weiterlaufen müssen, in
     `$TMPDIR/ki-uat-keep.txt` ein.
   - Im aktuellen Branch auf Desktop und Mobil tatsächlich durchklicken und
     im SUMMARY mit URL, Viewports und Ergebnis belegen:
     1. deutsche Beschreibung, englischer Fallback und fehlende Beschreibung
        ohne technischen Hinweis in der normalen Ansicht,
     2. zusätzliche Plattform knapp unter, genau bei und über der Grenze,
     3. vorhandener PC- und PS3-Game-Download-/Manifestpfad, auch für kleine
        Fixture bzw. fehlende PS3-Altinventur,
     4. Shared-Dialog, Abbruch sowie normaler kleiner Direktdownload.
   - Keine Geheimnisse, Cookies, Tokens oder aufgelösten Umgebungswerte in
     Planung, Zusammenfassung oder Logs ablegen.

## Akzeptanzkriterien

- PC und PS3 verlieren keinen zuvor freigegebenen sicheren Shared-Download-
  oder Manifestpfad wegen Größe oder fehlender historischer FOLDER-Inventur.
- Bei zusätzlichen Plattformen erscheint der bestehende Shared-Downloader nur
  ab exakt 4.000.000.000 bekannter Bytes; darunter und bei unbekannter Größe
  bleibt der bestehende Direktdownload erhalten.
- Kleine zusätzliche Konsolen-ROMs lösen durch die Erweiterung keine
  vollständige Inventur oder SHA-256-Berechnung aus.
- Die eine bestehende Manifest-/Queue-/Transportkette und sämtliche
  Sichtbarkeits-, Berechtigungs- und Snapshotgrenzen bleiben unverändert
  wirksam.
- Der SUMMARY enthält reproduzierbare isolierte Browser-UAT-Nachweise für
  Desktop und Mobil sowie aufgeräumte oder in `ki-uat-keep.txt` deklarierte
  temporäre Ressourcen.
