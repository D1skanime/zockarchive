---
phase: 50-za-gemeinsame-pc-dateiauswahl-f-r-gro-e-spiele-korrekt-wiede
plan: 02
status: complete
wave: 2
---

# Plan 50-02 Summary

The immutable manifest contract accepts at most 4,096 unique positive member
IDs for a whole-folder request. It locks all IDs to the one verified neutral
FOLDER component of the requested ROM, rejects foreign and empty selections,
and snapshots only selected verified members. The inclusive source-size gate is
unchanged and executes before selection.

The authorized preparation request is explicit (`whole_folder` plus
`prepare_only`), validates/reconciles the mapped inventory, and returns 204
without creating a manifest or transfer.
