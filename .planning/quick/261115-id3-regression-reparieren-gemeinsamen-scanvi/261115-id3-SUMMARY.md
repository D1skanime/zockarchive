---
quick_id: 261115-id3
title: Regression reparieren: gemeinsamen ScanView-Test-Harness verwenden
status: complete
job_id: 261112-240c
phase: 44
completed_at: "2026-11-15T13:15:00Z"
---

# Ergebnis

`ScanCollection.test.ts` besitzt jetzt genau ein wiederverwendbares Vue-Harness.
Es liefert weiterhin die echte `useScanView`-Instanz an beide Parametertestgruppen;
die Discovery-Anfrage, die Readiness-Zustände und die Sperre von `start` bei
fehlender Bereitschaft werden unverändert geprüft.

## Nachweis

- `npm --prefix frontend test -- src/v2/views/ScanCollection.test.ts src/v2/views/Scan.test.ts src/v2/data/directFolderMappingReadiness.test.ts` — 3 Dateien, 15 Tests grün.
- `trunk check frontend/src/v2/views/ScanCollection.test.ts` — keine Befunde.

Es wurden keine Produktdateien geändert und keine Assertions abgeschwächt.
