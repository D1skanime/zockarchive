---
id: 261125-za48-post-uat-accepted-logic-tests
title: Post-UAT-Logiktests fuer Phase-48-Beschreibungen und Shared-Downloads
status: planned
scope: test-and-planning-only
product_head: affa2f3ed
---

# Quick Plan

Die Live-Abnahme ist freigegeben. Diese Quick-Aufgabe ergänzt ausschließlich
direkte Regressionstests für den akzeptierten Phase-48-Vertrag. Produktcode,
API-Schemas, Fixtures außerhalb der Testdateien sowie Browser-, Klick- und
Snapshot-Tests bleiben unverändert.

1. In `frontend/src/v2/components/GameDetails/OverviewTab.test.ts` die
   bestehenden direkten Description-Prop-Fälle auf den akzeptierten
   Normalansichtsvertrag ausrichten: deutscher Text und ein englischer
   ScreenScraper-Fallback bleiben sichtbar und mit dem tatsächlich aufgelösten
   `lang` ausgezeichnet, enthalten aber weder Sprach-Fallback-, Anbieter- noch
   Quellenhinweise. Der leere Description-Fall zeigt weiterhin ausschließlich
   den etablierten Leerzustand ohne technische Hinweisfläche. Die neuen Fälle
   setzen ausschließlich Props und prüfen den resultierenden Zustand/Text,
   ohne `trigger`, Pointer-, Maus- oder Tastaturereignisse.

2. In `frontend/src/v2/components/GameDetails/PcDlcDetail.test.ts` denselben
   Vertrag für die normale PC-DLC-Detailansicht abdecken: angeforderte deutsche
   Beschreibung, englischer Fallback und fehlende Beschreibung; alle drei
   Fälle prüfen Text und Sprache bzw. Leerzustand direkt, und verbieten die
   technischen `rom.description-*`-Provenienz-/Fallbackmeldungen. Die
   bestehenden Editor-Tests bleiben als Gegenprobe bestehen, damit die
   ausdrücklich geöffnete Metadatenverwaltung nicht versehentlich von der
   normalen Präsentationsregel erfasst wird. Auch diese neuen Fälle enthalten
   keine Ereignissimulation.

3. `backend/tests/endpoints/responses/test_folder_download.py` als fokussierten
   Test des reinen `shared_download_capability`-Contracts anlegen. Synthetische
   `Rom`-/`RomComponent`-Daten decken Einzeldatei und Ordner jeweils knapp
   unter, genau bei und über `SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES` ab:
   zusätzliche Plattformen erhalten nur bei bekannter vollständiger,
   gehashter Inventur ab einschließlich 4.000.000.000 Bytes eine Capability;
   fehlende/inkonsistente Größen- oder Manifestdaten ergeben keine Schätzung
   und keine Capability. PC und PS3 behalten mit derselben sicheren
   persistierten Inventur ihren bisherigen kleinen Capability-Vertrag. Teste
   außerdem fehlende Dateien, unvollständige Members und ungültige Hashes als
   sichere Ablehnung.

4. `backend/tests/handler/test_scan_folder_download.py` um reine
   `_is_shared_download_inventory_eligible`- und
   `reconcile_scanned_shared_download_inventory`-Verträge ergänzen: weitere
   Plattformen bauen unterhalb bzw. bei unbekannter Größe keine Inventur,
   erreichen ab der inklusiven Schwelle den vorhandenen Reconciliation-Pfad;
   PC/PS3 behalten ihre Bestandspfade. Der autorisierte Scan-Schalter und
   Fehler beim Inventarbau dürfen weder Komponenten synchronisieren noch
   Zugriff freigeben. Ergänze nur einen gezielten
   `backend/tests/endpoints/test_download_manifests.py`-Fall, falls nötig, um
   zu beweisen, dass der bestehende Sichtbarkeits-/Autorisierungsgate vor einer
   PS3-On-Demand-Inventur greift; keine Pfad- oder Auth-Bypässe einführen.

5. Ausschließlich die neu geänderten und direkt betroffenen Dateien ausführen:
   `backend/tests/endpoints/responses/test_folder_download.py`,
   `backend/tests/handler/test_scan_folder_download.py`, gegebenenfalls
   `backend/tests/endpoints/test_download_manifests.py` sowie in den beiden
   Vue-Dateien nur die neu benannten Description-Contract-Fälle per
   Vitest-Testnamenfilter. Damit werden keine bereits im selben Bestand
   vorhandenen Klick-/Maus-Tests mitgestartet. Keine Vollsuite starten. Einen
   reinen Zeitlimit-Ausreißer höchstens einmal als einzelne Testdatei
   wiederholen und im Summary als VM-Last statt als Produktfehler festhalten.

6. Nach grünen gezielten Läufen nur die Testdateien sowie
   `.planning/quick/261125-za48-post-uat-accepted-logic-tests/{PLAN,SUMMARY}.md`
   und den passenden `STATE.md`-Eintrag committen. Das Summary nennt die
   exakten Testdateien, die abgedeckten Grenzen und das Ergebnis; keine
   Secrets, Umgebungswerte, Browser-Harness oder Produktdateien aufnehmen.

## Direkt betroffene bestehende Tests

- `frontend/src/v2/components/GameDetails/OverviewTab.test.ts`
- `frontend/src/v2/components/GameDetails/PcDlcDetail.test.ts`
- `backend/tests/handler/test_scan_folder_download.py`
- `backend/tests/endpoints/test_download_manifests.py` (nur wenn der
  Sichtbarkeitsgate-Fall dort ergänzt wird)

## Akzeptanzkriterien

- Tests verwenden direkte Komponenten-Props, Pure-Function- und
  Endpoint/Handler-Aufrufe, keine Maus-/Klicksimulationen oder Snapshots.
- Deutsche, englisch gefallbackte und fehlende Beschreibungen behalten ihre
  fachliche Auswahl, ohne technische Herkunfts- oder Fallbacktexte in normalen
  Ansichten.
- Der gemeinsame Downloadvertrag schützt PC/PS3-Bestand, lässt zusätzliche
  Plattformen nur ab der inklusiven 4-GB-Grenze zu und behandelt unbekannte
  Größe nie als null oder geschätzt.
- Fehler-, Sichtbarkeits- und Autorisierungsgrenzen bleiben als sichere
  Ablehnung nachweisbar.
- Nur Tests und GSD-Artefakte werden geändert und der gezielte Testumfang ist
  vollständig grün.
