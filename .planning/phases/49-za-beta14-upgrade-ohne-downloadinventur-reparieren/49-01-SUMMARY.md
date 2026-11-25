---
phase: 49-za-beta14-upgrade-ohne-downloadinventur-reparieren
plan: 01
status: complete
wave: 1
---

# Plan 49-01 Summary

## Outcome

Reproduced the Beta14 no-inventory dead end in a disposable detached worktree
at exactly `be0e4ee888d58008f19f8eb1fbd7ee929cbe676a`. The isolated fixture
persisted 3,076 legacy `RomFile` facts for a nested PS3 layout and persisted
zero FOLDER components, manifest members, and manifests. No FOLDER component
was seeded or manufactured.

The pinned baseline's exact `shared_download_capability`,
`prepare_folder_download_details`, and `ensure_shared_download_inventory`
function ASTs were evaluated with the fixture facts. The legacy folder
projected no capability, so the Game Download action was unreachable, and the
manifest inventory check rejected it with the existing
`manifest folder inventory is unavailable` result. The endpoint's existing
error map makes that bounded result `409 manifest_folder_inventory_unavailable`.

## Boundary Evidence

All of the following produced no capability and the same inventory rejection
without creating inventory, hashes, members, or manifests:

- existing PS3 ISO-shaped single-file facts without FOLDER inventory;
- another platform immediately below, exactly at, and above 4,000,000,000
  bytes;
- unknown-size and unreadable-source facts.

Static baseline checks also confirmed that visibility is asserted before the
PS3 inventory check, mapping stale reads fail closed through
`StaleMappedReadError`, and the mapped read context applies relative-path
normalization with storage-escape handling before exposing content. These are
source-level rejection checks only, not a request against a real service.

## Scope and Limitation

The detached baseline's full application import could not be used as a live
endpoint harness in this environment: its isolated import graph first requires
runtime configuration and then reaches a circular import between filesystem
and metadata modules. No service, database, Docker resource, browser harness,
or real account was started to bypass that limitation. The direct baseline
function evaluation plus endpoint/read-context source ordering is therefore
the exact evidence collected, and no claim of an HTTP, browser, database, NAS,
or production reproduction is made.

## Cleanup and Verification

- The temporary fixture used the prior bounded helper to create 3,076 small
  nested PS3 files below `$TMPDIR/za49-beta14-reproduction`.
- The harness exited 0 with this sanitized aggregate receipt:
  `folder_component_count=0`, `manifest_member_count=0`,
  `manifest_count=0`, `legacy_detail_has_game_download_action=false`, and all
  six boundary cases rejected.
- The detached worktree, fixture SQLite file, temporary runtime files,
  temporary virtual environment, fixture source, and harness were removed.
  A post-cleanup check confirmed that the named `$TMPDIR` descendant no longer
  existed.
- No repository test, Vitest, pytest, lint, typecheck, build, browser check,
  Docker action, product-code change, commit, push, or merge was performed.
