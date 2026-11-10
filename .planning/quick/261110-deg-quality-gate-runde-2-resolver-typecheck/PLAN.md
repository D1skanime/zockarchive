---
id: 261110-deg
slug: quality-gate-runde-2-resolver-typecheck
status: in_progress
related_phase: 42-aehnliche-spiele-ausserhalb-der-bibliothek-ein-oder-ausblenden
---

# Quality Gate Runde 2: Resolver-Typecheck

## Ziel

Die drei neuen TypeScript-Fehler in der Inflight-Auflösung ähnlicher Spiele beheben, ohne Tests zu ändern oder auszuführen.

## Umsetzung

1. Die Inflight-Bereinigung über ein vom Promise unabhängiges Identitätstoken steuern, damit ein verspäteter Request keinen neueren Eintrag löschen kann.
2. Den Lookup explizit als `Promise<LookupResult>` typisieren, damit alle Fehlerpfade den diskriminierten Ergebnistyp einhalten.
3. Ausschließlich `cd frontend && npm run typecheck` ausführen und das Ergebnis dokumentieren.

## Akzeptanzkriterien

- TS2454, TS2345 und TS2322 treten nicht mehr auf.
- Erfolgreiche und bestätigte Nichttreffer bleiben pro Konto cachebar, Fehler nicht.
- Eine alte Promise-Bereinigung entfernt keinen neuen Inflight-Lookup derselben IGDB-ID.
