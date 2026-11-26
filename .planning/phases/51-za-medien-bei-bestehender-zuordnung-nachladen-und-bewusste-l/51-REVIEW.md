---
phase: 51-za-medien-bei-bestehender-zuordnung-nachladen-und-bewusste-l
reviewed: 2026-11-26T16:10:00Z
depth: deep
files_reviewed: 27
files_reviewed_list:
  - backend/endpoints/roms/__init__.py
  - backend/endpoints/roms/media.py
  - backend/endpoints/sockets/scan_platform_execution.py
  - backend/endpoints/sockets/scan_rom_identification.py
  - backend/handler/metadata/rom_media.py
  - docs/BACKEND_ARCHITECTURE.md
  - docs/FRONTEND_ARCHITECTURE.md
  - frontend/src/locales/bg_BG/rom.json
  - frontend/src/locales/cs_CZ/rom.json
  - frontend/src/locales/de_DE/rom.json
  - frontend/src/locales/en_GB/rom.json
  - frontend/src/locales/en_US/rom.json
  - frontend/src/locales/es_ES/rom.json
  - frontend/src/locales/fr_FR/rom.json
  - frontend/src/locales/hu_HU/rom.json
  - frontend/src/locales/it_IT/rom.json
  - frontend/src/locales/ja_JP/rom.json
  - frontend/src/locales/ko_KR/rom.json
  - frontend/src/locales/pl_PL/rom.json
  - frontend/src/locales/pt_BR/rom.json
  - frontend/src/locales/ro_RO/rom.json
  - frontend/src/locales/ru_RU/rom.json
  - frontend/src/locales/tr_TR/rom.json
  - frontend/src/locales/zh_CN/rom.json
  - frontend/src/locales/zh_TW/rom.json
  - frontend/src/v2/components/Dialogs/MatchRomDialog.vue
  - frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 51: Code Review Report

**Reviewed:** 2026-11-26T16:10:00Z
**Depth:** deep
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Final focused re-review after Quick 261126-lg6 and Quick 261126-ly4. The
three former blockers are fixed: the successful explicit refresh installs its
returned canonical ROM, a failed post-match publication reloads its committed
canonical match and version, and media-only scan transport/decode failures are
contained to the affected ROM so sibling work can reach `scan:done`.

One reachable conflict-recovery path still drops all user feedback when the
follow-up canonical GET fails. No security regression, authorization gap, or
new provider egress was found in the reviewed diff. Locale parity was inspected
for the new partial-publication message; all 18 locale files contain the key.

## Narrative Findings (AI reviewer)

### Previous blocker disposition

- **CR-01 fixed:** the single-ROM explicit refresh consumes its `DetailedRom`
  response and updates the shared ROM state before closing
  (`RefreshMetadataDialog.vue:331-339`).
- **CR-02 fixed:** a provider-publication 409 after a changed manual match
  refreshes the canonical ROM and optimistic version, retaining the selected
  candidate for the retry (`MatchRomDialog.vue:493-508`).
- **CR-03 fixed:** media-only scan hydration catches `TransportError` and
  `DecodingError` inside the individual ROM coroutine, allowing the gather to
  continue and emit normal completion (`scan_platform_execution.py:132-178`).

## Warnings

### WR-01: Conflict recovery can fail silently and retain stale retry state

**Classification:** WARNING

**File:** `/home/d1sk/pc-game-download-portal/frontend/src/v2/components/Dialogs/RefreshMetadataDialog.vue:341-344`

**Issue:** On a 409, the dialog awaits `romsStore.refreshRom()` inside the
error handler but does not catch a failure from that follow-up GET. A temporary
network or server failure after the original conflict therefore rejects
`onScan()` before line 345 shows the original error. The dialog retains the
stale ROM/version and the user receives no retry guidance, which makes a
subsequent version-locked media action likely to conflict again.

**Fix:** Keep canonical reload best-effort and always surface the original
operation error:

```ts
if (axios.isAxiosError(error) && error.response?.status === 409) {
  try {
    const canonicalRom = await romsStore.refreshRom(rom.id);
    roms.value = [canonicalRom];
  } catch (refreshError: unknown) {
    console.error("Media refresh canonical reload failed", refreshError);
  }
}
snackbar.error(errorMessage(error));
```

---

_Reviewed: 2026-11-26T16:10:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_

## REVIEW COMPLETE
