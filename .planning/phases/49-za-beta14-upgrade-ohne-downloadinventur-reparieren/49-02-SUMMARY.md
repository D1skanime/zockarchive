---
phase: 49-za-beta14-upgrade-ohne-downloadinventur-reparieren
plan: 02
status: complete
wave: 2
---

# Plan 49-02 Summary

## Outcome

The detailed-ROM projection now distinguishes persisted verified folder evidence
from a legacy folder that is only `preparable`. Detail GET remains limited to
persisted ROM/component facts and does not read, walk, hash, or mutate storage.

Only the existing protected whole-folder manifest POST can prepare a legacy
folder. After visibility succeeds, it resolves the owning active mapping,
validates its ID and revision with `MappingReadContext`, creates an
`FSRomsHandler.for_mapping` handler for the mapping-relative ROM path, and uses
the existing bounded shared-component builder plus component reconciliation.
The endpoint reloads the ROM, validates the resulting verified inventory, and
uses the unchanged locked manifest issuer and delivery path.

## Safety and compatibility

- Preparation requires a non-missing, non-single-file legacy folder with a
  known persisted size at or above 4,000,000,000 bytes.
- Existing ready evidence retains its previous predicate. A preparable response
  reports no members and is never considered transfer-ready.
- Missing mappings, stale or unreadable mapped storage, invalid paths, source
  instability, and incomplete inventory are reduced to the existing bounded
  `manifest_folder_inventory_unavailable` rejection after visibility.
- No PS3-specific resolver, direct path access, synthetic member, manifest, or
  alternate transfer route was introduced.

## Contract and documentation

`FolderDownloadCapabilitySchema.state` is an additive generated OpenAPI field
with `ready` and `preparable` values. The generated detailed-ROM schema keeps
its existing reference to that capability. `docs/BACKEND_ARCHITECTURE.md` now
documents the read-only detail projection and the authorized POST-only mapped
preparation boundary.

## Verification

- Ran `git diff --check` successfully.
- Generated the OpenAPI TypeScript contract using a temporary local schema
  process with an isolated temporary `ROMM_BASE_PATH`, then stopped the local
  HTTP process and removed its temporary files.
- Ran scoped `trunk check` on the changed backend and documentation files.
  It applied import formatting in `download_manifests.py` and finished with
  `Checked 4 files` and `No issues`.
- No automated tests, browser tooling, Docker, service, NAS, Dev, production,
  commit, push, merge, or branch operation was run.
