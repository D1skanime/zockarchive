---
phase: 50-za-gemeinsame-pc-dateiauswahl-f-r-gro-e-spiele-korrekt-wiede
plan: 01
status: complete
wave: 1
---

# Plan 50-01 Summary

## Outcome

The Beta15 selection bypass was reproduced from the committed pre-fix source
contract without accessing a persistent runtime: a ready `folderDownload`
made `DownloadSelectionDialog` treat the dialog as `isWholeFolder`, cleared
`selectedMemberIds`, hid the existing member tree, and caused `PcComponents`
to send only `{ whole_folder: true }`.

The source and request-schema inventory identified the independent 100-member
transport ceiling. The implemented replacement preserves opaque verified member
IDs and raises that deliberately bounded request ceiling to 4,096, covering the
required 564 and 3,000 member cases without silent truncation.

## Scope

This reproduction is source-contract evidence only. No database, source
library, NAS, service, browser fixture, test suite, or production resource was
used before human UAT.
