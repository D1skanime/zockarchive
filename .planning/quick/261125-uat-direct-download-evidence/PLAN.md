---
id: 261125-uat-direct-download-evidence
title: Isolierten Nachweis fuer kleinen Direktdownload und Beschreibungsansichten korrigieren
status: completed
product_head: 0e38e5cb574b74c55f85e9b79370551fe7ca774f
scope: harness-and-evidence-only
---

# Quick Plan

## Ausgangslage

`mobile-under-overview.png` zeigt statt eines kleinen Direktdownloads den
Dateien-Reiter und den Clipboard-Fehler. Die bisherige Harness hat damit das
Kettensymbol (Link kopieren) statt des Download-Buttons getroffen. Der
Produktstand wird auf `0e38e5cb574b74c55f85e9b79370551fe7ca774f` eingefroren;
Produktcode, Tests und die bereits vorhandenen Schwellen- und
Bestandsnachweise bleiben unveraendert.

## Umsetzung

1. Die vorhandene autorisierte isolierte Harness unter
   `/tmp/za-261124-hds-browser/isolated_browser_proof.py` ausschliesslich fuer
   den Nachweis erweitern. Vor Start und nach Abschluss mit `git rev-parse
   HEAD` nachweisen, dass der Product-HEAD unveraendert der oben festgehaltene
   Commit ist. Eine kleine synthetische Direktdownload-Datei mit festem Namen,
   festem Byteinhalt und dokumentierter Bytegroesse bereitstellen. Keine grosse
   Datei, keinen Shared-Transfer und keine bestehenden Grenz-, PC- oder
   PS3-Fixtures erneut aufbauen.

2. Den Klick im Dateien-Reiter semantisch und nicht ueber Icon-Positionen
   ausfuehren. Die Harness nutzt fuer die bekannte Fixture-Datei den durch
   `FileRow.vue` definierten zugreifbaren Buttonnamen `Download {relativePath}`
   via `page.getByRole("button", { name: exactDownloadName, exact: true })`.
   Sie stellt vor dem Klick sicher, dass kein Button mit `Copy download link for
   {relativePath}` verwendet wird, wartet dann auf Playwrights
   `page.waitForEvent("download")`, speichert den Download unter einem
   Evidence-Pfad und prueft Dateiname, erwarteten Byteinhalt und exakte
   Bytegroesse. Bei HTTP fehlende Clipboard-API oder Clipboard-Berechtigung
   wird separat als Harnessgrenze protokolliert und weder als Downloadfehler
   noch als Downloadbeleg gewertet.

3. Den Ablauf vollstaendig bei `1440x960` und `390x844` wiederholen. Die
   Screenshots fuer die Beschreibungen werden jeweils aus dem aktiven
   Overview-Tab erzeugt und enthalten sichtbar: deutsche Beschreibung,
   englische Fallback-Beschreibung sowie den fehlenden Beschreibungszustand
   ohne technischen Hinweis. Fuer beide Profile den erfolgreichen kleinen
   Direktdownload mit Screenshot des korrekten Dateien-Reiters sowie
   maschinenlesbarer Download-Evidence erfassen. Alte missverstaendliche
   `*-under-overview.png`-Belege ersetzen oder deutlich als ungültig
   kennzeichnen. Die Evidence bleibt unter
   `/tmp/za-261124-hds-browser/isolated/browser-proof` und der bestehende
   Eintrag `path za-261124-hds-browser/isolated` bleibt in
   `/tmp/ki-uat-keep.txt` erhalten.

4. Eine `SUMMARY.md` im selben Quick-Ordner erstellen. Sie nennt den
   unveraenderten Product-HEAD, die lokale Harness-URL, beide Viewports,
   genaue gespeicherte Download-Dateinamen und gepruefte Groessen/Inhalte
   (ohne Zugangsdaten), die drei echten Overview-Screenshotpaare und eine
   eindeutige Clipboard-Abgrenzung. Keine Testsuite starten und keine
   Produktdatei, Auth-Daten, Dev-Instanz oder Datenbank veraendern.

## Akzeptanzkriterien

- Der Product-HEAD bleibt vor und nach der Harness exakt
  `0e38e5cb574b74c55f85e9b79370551fe7ca774f`.
- Desktop und Mobil enthalten je einen echten Playwright-Download-Event sowie
  eine gespeicherte kleine Datei mit erwartetem Namen, Inhalt und Bytegroesse.
- Kein Link-kopieren-Button, Clipboard-Toast oder Clipboard-Fehler dient als
  Downloadnachweis.
- Je ein aussagekraeftiges Overview-Screenshotpaar belegt Deutsch, englischen
  Fallback und fehlende Beschreibung ohne technischen Hinweis.
- Die bestehenden 4-GB-, PC- und PS3-Nachweise werden nicht erneut erzeugt
  oder durch die Evidence-Korrektur veraendert.
