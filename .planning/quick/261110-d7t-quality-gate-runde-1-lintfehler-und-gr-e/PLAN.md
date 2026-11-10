---
id: 261110-d7t
slug: quality-gate-runde-1-lintfehler-und-gr-e
status: in_progress
---

# Quality Gate Runde 1: Lintfehler und Größenüberschreitungen

## Ziel

Den neuen ESLint-Befund in der Similar-Games-Auflösung beheben und die Phase-42-Integrationsbereiche aus den drei bereits übergroßen Host-Dateien in kohärente v2-Bausteine auslagern. Keine Tests ändern oder ausführen.

## Umsetzung

1. Die Promise-Selbstreferenz im Inflight-Cache mit einer konstanten Deferred-Promise-Struktur ausdrücken.
2. Ähnliche-Spiele-Filterung, den Overview-Abschnitt und die Einstellungskomposition in feature-nahe Composables beziehungsweise Komponenten extrahieren.
3. Ausschließlich Trunk für die berührten Dateien prüfen und die Größen gegenüber dem Ausgangsstand kontrollieren.

## Akzeptanzkriterien

- `eslint/prefer-const` meldet keinen Befund mehr.
- Die drei gemeldeten Host-Dateien sind gegenüber ihrem Vorzustand nicht gewachsen.
- Verhalten und öffentliche Host-Schnittstellen bleiben erhalten.
