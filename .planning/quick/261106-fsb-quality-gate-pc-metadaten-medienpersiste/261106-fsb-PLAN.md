---
quick_id: 261106-fsb
title: Quality-Gate, PC-Metadaten-Medienpersistenz auslagern
status: in_progress
created: 2026-11-06
---

# Quick Task 261106-fsb: PC-Metadaten-Medienpersistenz auslagern

## Ziel

Das durch die letzte Cover-Erhaltungsanpassung verursachte Wachstum von
`pc_metadata.py` fachlich sauber zurücknehmen, ohne das Verhalten zu ändern.

## Aufgaben

1. Die Persistenz der im PC-Metadaten-Review gewählten Cover- und
   Screenshot-Medien in ein abgegrenztes Endpoint-Hilfsmodul verschieben.
2. Die bestehende Original-Cover-Erhaltung beibehalten: ein Provider-Cover darf
   die persistierte Originalreferenz nur aktualisieren, wenn kein aktives
   eigenes Cover ausgewählt ist.
3. Den Aufrufer auf das Hilfsmodul umstellen und den Umfang von
   `pc_metadata.py` gegen den Gate-Ausgangswert prüfen.

## Verifikation

- `git diff --check`
- Zeilenzahl von `backend/endpoints/roms/pc_metadata.py` gegen den
  Ausgangswert 815 prüfen.
- Keine Tests oder Testsuiten starten, wie für diese UAT-Phase vorgegeben.
