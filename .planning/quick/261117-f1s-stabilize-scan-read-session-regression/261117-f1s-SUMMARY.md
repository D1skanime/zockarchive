---
quick_id: 261117-f1s
title: Regression: Scan-Read-Session-Prozesstests stabilisieren
status: complete
---

# Ergebnis

Die zwei fehlgeschlagenen Tests sind prozessbasierte Integritätsprüfungen. Ihre
Reihenfolge-, Alias- und Exitcode-Assertions waren korrekt, jedoch die bisherigen
10-/15-Sekunden-Budgets nicht robust gegen parallele, kalte Python-Imports im
vollständigen MariaDB-Gate. Die Tests bleiben begrenzt und prüfen unverändert
dieselben fachlichen Eigenschaften; die Start-/Abschluss-/Import-Budgets sind
nun 30 bzw. 45 Sekunden.

## Verifikation

- `uv run --project backend python backend/tools/ci_target.py --dialect mariadb --shard 6 pytest`
  — bestanden, inklusive automatischem Cleanup und Source-Immutable-Nachweis.
- Keine Produktdatei geändert.
