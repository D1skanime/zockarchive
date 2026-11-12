---
phase: quick
plan: 261112-cr2
subsystem: setup, storage mapping, browser UAT
tags: [zockarchive, setup, scan, browser-uat, docker]
requires:
  - phase: 44-za-einrichtungsassistent-ordner-ausschlie-en-und-plattformen
    provides: persisted direct Games-folder dispositions
provides:
  - isolated real-scan evidence for the initial direct-folder exclusion state
  - a documented blocking duplicate-platform mapping constraint
affects: [setup recovery, platform storage mappings, library management]
tech-stack:
  added: []
  patterns: [label-bound disposable browser UAT]
key-files:
  created:
    - 261112-cr2-SUMMARY.md
  modified: []
key-decisions:
  - "Do not alter the single-active-mapping constraint during UAT."
requirements-completed: []
duration: 28min
completed: 2026-11-12
---

# Quick Task 261112-cr2: Direct-folder transition UAT Summary

**A real isolated first scan proves Quartz alone is catalogued, while the required Ruby-to-Windows transition is blocked by the existing one-active-path-per-platform mapping constraint.**

## Results

- Normal browser login reached completed-setup Library Management with exactly three direct-folder rows.
- First real scan showed exactly Quartz-UAT-Title. Ruby-UAT-Title and Sable-UAT-Title were absent.
- Selecting Ruby-Echo as Windows and saving displayed a non-sensitive mapping-update error. A reload confirmed Ruby and Sable remained excluded.
- The later real scan completed but did not catalogue Ruby, so the required two-title acceptance condition is not met.
- Screenshot evidence is in the job `screens/` directory under the `261112-cr2-fresh-` prefix. The full sanitized account is in the job UAT report.

## Blocking Finding

The persisted setup model permits only one active `PlatformStorageMapping` for Windows. Quartz already owns Windows, so the requested second Windows assignment for Ruby is rejected. Supporting two direct folders for one platform requires an architectural decision about multi-path platform storage, not a UAT-only change.

## Evidence

- Initial mapping/search: `261112-cr2-fresh-win-filter-desktop.png`, `261112-cr2-fresh-setup-desktop.png`, and `261112-cr2-fresh-setup-mobile.png`.
- First real scan: `261112-cr2-fresh-first-scan-desktop.png`.
- Completed-setup projection and rejected transition: `261112-cr2-fresh-library-before-transition-desktop.png` and `261112-cr2-fresh-library-after-transition-desktop.png`.
- Later real scan: `261112-cr2-fresh-later-scan-desktop.png`.

## Deviations from Plan

None auto-fixed. The UAT exposed an architectural blocker, so the requested duplicate Windows mapping was not altered automatically.

## Known Stubs

None.

## Next Phase Readiness

Blocked pending a decision on whether a platform may own multiple direct Games paths. The exact token-labelled runtime, volumes, network, image, and temporary root have been removed and their absence verified; the stale similarly named volume remains untouched.

## Self-Check: PASSED

- The summary and sanitized job report exist.
- Commit `9167d14a0` exists in the current branch history.
- Zero exact token-labelled containers, network, and volumes remain; the token-labelled temporary root is absent.
- The stale `za-261112-cr2-uat-mariadb-data` volume remains present and untouched.
