---
id: 261123-9s2
title: RomComponentKind-Importgrenze in der Detailantwort korrigieren
status: complete
---

# Quick Plan

1. Locate each unresolved RomComponentKind annotation in the response model.
2. Restore its canonical ORM enum import without changing API, permission, or
   manifest behavior.
3. Run the requested focused Ruff, mypy, and changed-file Trunk checks.
