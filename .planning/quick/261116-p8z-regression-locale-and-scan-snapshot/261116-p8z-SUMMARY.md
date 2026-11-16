---
quick_id: 261116-p8z
title: Regression: Locale-Contracts und alte Scan-Snapshots
status: complete
---

# Ergebnis

- Die 18 explizit übersetzten `scan`-Locale-Verträge enthalten nun die geprüften
  Prüfsummen. Der vollständige Validator bleibt unverändert; sein Testbudget ist
  mit 20 Sekunden für parallele CI-Läufe ausreichend.
- Alte gespeicherte Scan-Aufträge ohne `type` fallen beim Replay explizit auf
  `quick` zurück. Der SQL-Test prüft dabei sowohl die übergebene Sprache als auch
  diesen Default über den tatsächlichen Mixed-Scan-Einstieg.

## Verifikation

- `npm run test -- src/v2/config/project-locales.test.ts src/v2/composables/useManualDescription/provenance.locales-parity.test.ts`
  — 64 Tests bestanden.
- `uv run --project backend python backend/tools/ci_target.py --dialect mariadb --shard 5 pytest`
  — bestanden, temporäre CI-Ressourcen bereinigt; Nachweis unter dem
  job-eigenen temporären Evidence-Pfad.
