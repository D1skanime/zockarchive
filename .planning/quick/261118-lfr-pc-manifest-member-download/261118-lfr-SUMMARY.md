---
quick_id: 261118-lfr
status: complete
completed: 2026-11-18
---

# PC-Einzelmitglied-Download

## Ursache und Umsetzung

Die Auswahloberfläche konnte gescannte Mitglieder aus allen PC-Komponenten
anfordern, während die Manifest-Erzeugung `hotfix`, `language_pack` und
`unresolved` vor der Mitgliedsprüfung ausschloss. Ein einzelnes MP3 in einer
solchen Komponente führte deshalb für ein bereits sichtbares ROM zu der
maskierten Manifest-404.

Die Manifest-Erzeugung akzeptiert jetzt alle scannerzeugten Komponenten. Nach
der unveränderten Sichtbarkeitsprüfung liefert eine echte Erzeugungsablehnung
für ein sichtbares ROM einen begrenzten 409-Code und protokolliert den
konkreten, pfadfreien Grund. Fehlende oder nicht sichtbare ROMs behalten die
generische Manifest-404.

## Nachweis

Eine isolierte MariaDB/Redis/Backend-Umgebung enthielt einen Windows-ROM mit
einer einzigen gescannten MP3 in einer `unresolved`-Komponente. Der reguläre
HTTP-Manifest-POST mit deren Komponenten- und Mitglied-ID lieferte 201; der
aus der Antwort abgeleitete Einzelabruf lieferte 200 mit genau 29 Byte. Alle
Wegwerfcontainer, Volumes, Netzwerk und Testdaten wurden entfernt.

Der bereitgestellte aktuelle Browserdienst zeigte die PC-Download-Aktion bei
ROM 38 auf Desktop und Mobil und öffnete den Dialog. Seine anschließende
Benutzerabfrage lieferte jedoch 401, daher konnte dort kein belastbarer
Einzel-MP3-Abruf belegt werden. Das ist als Umgebungsnachweis offen und nicht
als erfolgreiches Browser-Download-Ergebnis behauptet.

## Verifikation

- `git diff --check` erfolgreich.
- Der gezielte Ruff-Aufruf war in Host und Wegwerfimage nicht verfügbar.
- Keine Tests oder Testsuiten vor Live-UAT gestartet.
