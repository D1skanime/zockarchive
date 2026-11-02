# PC Save Backups Design

## Intent

Users need to preserve and later manually restore arbitrary Windows PC save
folders from a game detail page. Existing single-file saves and device sync are
not changed.

## Goals

- Upload a complete folder as a ZIP archive while preserving relative paths and
  bytes.
- Persist owner-scoped backup metadata, SHA-256 values, a per-file manifest,
  and the Windows restore path.
- List, download, update the restore path, and delete backups from v2.
- Create one private generated note per successful backup without relying on
  that note for the durable backup record.

## Non-goals

- No automatic discovery of Windows save paths.
- No server-side extraction or automatic writes to a client computer.
- No public/community sharing and no change to existing save/device-sync flows.

## Approaches considered

1. Model a folder backup as many existing `Save` rows. This would entangle the
   device sync conflict model with folders and would not provide one immutable
   downloadable archive or restore metadata.
2. Store a ZIP only with no database model. This makes authorization,
   management, integrity details, and note linkage unreliable.
3. Add a dedicated `SaveBackup` model and handler, reuse existing protected
   route, ROM visibility, owned-storage policy, atomic filesystem primitives,
   and note handler. This is selected because it keeps the new aggregate
   durable and owner-scoped without duplicating existing asset behavior.

## Architecture

The browser packages selected `webkitRelativePath` files into a ZIP client-side
and posts the archive as multipart form data. The backend accepts only a bounded
ZIP upload, validates every ZIP member without extracting it, streams the
incoming archive atomically to the owned asset storage, computes archive and
per-file SHA-256 values, then creates the model row and private generated note.
Failures remove the temporary/final archive before responding.

`SaveBackup` owns immutable archive metadata and an optional generated
`RomNote` link. A manual note is never selected or overwritten. Updating a
restore path updates the generated note when it remains present. Deleting a
backup deletes its archive, model row, and its generated note; deleting the
note independently never compromises the durable backup metadata.

## Constraints and assumptions

- Archives use the owned asset storage, not game-library paths or ROM resource
  paths, and are always private to their creator.
- The client uses the broadly supported folder input (`webkitdirectory`), with
  a visible browser limitation message when relative paths are unavailable.
- Default limits are intentionally conservative and configurable in the backup
  module: 1 GiB archive, 10,000 files, 16 KiB relative path, and 2 GiB total
  uncompressed ZIP size. The server enforces all of them.
- Archive members must be regular, non-encrypted files with normalized relative
  POSIX paths. Symlinks, duplicate names, traversal, absolute paths and ZIP
  ratio abuse are rejected.
