---
quick_id: 261115-jlh
title: Frontend-Typecheck für gemeinsamen ScanView-Harness reparieren
status: complete
job_id: 261112-240c
phase: 44
completed_at: "2026-11-15T14:08:00Z"
---

# Ergebnis

Der gemeinsame Test-Harness bestätigt nach dem Vue-Mount weiterhin, dass eine
`useScanView`-Instanz vorhanden ist, und gibt sie nun mit dem expliziten deklarieren
Hook-Rückgabetyp zurück. Damit verliert TypeScript den Wert nicht mehr als `never`
über die asynchrone `setup`-Grenze.

Die Discovery-Argumente und die Bereitschaftsfehler-Assertions sind unverändert.

## Nachweis

- `npm --prefix frontend run typecheck` — grün.
- `npm --prefix frontend test -- src/v2/views/ScanCollection.test.ts src/v2/views/Scan.test.ts src/v2/data/directFolderMappingReadiness.test.ts` — 3 Dateien, 15 Tests grün.
- `trunk check frontend/src/v2/views/ScanCollection.test.ts` — keine Befunde.

Es wurden keine Produktdateien geändert und keine Assertions abgeschwächt.
