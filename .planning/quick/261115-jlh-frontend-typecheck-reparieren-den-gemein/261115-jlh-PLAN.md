---
quick_id: 261115-jlh
title: Frontend-Typecheck für gemeinsamen ScanView-Harness reparieren
status: complete
job_id: 261112-240c
phase: 44
wave: 1
depends_on: []
files_modified:
  - frontend/src/v2/views/ScanCollection.test.ts
  - .planning/STATE.md
---

# Quick Plan: ScanView-Harness typisieren

## Ziel

Den TypeScript-Kontrollfluss über die asynchrone Vue-Mount-Grenze im gemeinsamen
ScanView-Test-Harness explizit halten, ohne die getesteten Abläufe oder Assertions
zu verändern.

## Umsetzung

1. Das nach erfolgreichem Mount zurückgegebene Hook-Objekt erhält seinen deklarierten
   `useScanView`-Rückgabetyp.
2. Frontend-Typecheck, bestehende fokussierte Tests und der gezielte Linter werden
   ausgeführt.
