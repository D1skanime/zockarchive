---
id: 261107-8ee7-scan-explorer-locale
title: Localize scan explorer fallback values
status: in_progress
---

# Quick Plan: Localize Scan Explorer Fallback Values

Replace the English fallback text for the new scan explorer `operation-*` keys in the 15 non-English, non-German locale files. Keep the existing key structure, placeholders, and alphabetical ordering unchanged.

## Steps

1. Translate the scan explorer labels and messages in each affected `scan.json`.
2. Validate every affected JSON document and run `git diff --check`. No test suite is run before live UAT.
