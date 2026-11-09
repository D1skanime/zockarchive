---
id: 261107-8ee7-scan-explorer-locale
status: complete
date: 2026-11-07
---

# Quick Summary: Localize Scan Explorer Fallback Values

## Completed

- Replaced all English fallback values for the 27 scan explorer `operation-*` keys in the 15 non-English, non-German `scan.json` locale files.
- Preserved translation keys, interpolation placeholders, and locale JSON ordering.

## Verification

- Parsed each changed JSON file successfully with `jq empty`.
- `git diff --check` passed.
- No tests or test suite were run, as required before live UAT.
