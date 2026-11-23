<!-- generated-by: gsd-doc-writer -->

# ZockArchive Backend Architecture

**Analysis Date:** 2026-10-15

## System Overview

```text
Browser/PWA -> Vue Router, v2 views, Pinia, Axios/Socket.IO adapters
           -> /api/* and /ws
FastAPI     -> middleware, auth/session/CSRF, thin routers, Socket.IO mounts
Handlers    -> database | metadata/providers | filesystem/storage | scan/tasks
Storage     -> SQLAlchemy/Alembic | provider APIs | read-only library | Redis/RQ
```

The backend owns catalog state and API shapes. The Vue frontend never accesses the database or library directly. Pydantic response schemas in backend/endpoints/responses/ generate frontend/src/**generated**/.

## Component Responsibilities

| Component         | Responsibility                                                        | File                                                                                            |
| ----------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Application       | FastAPI composition, middleware, routers, WebSocket mounts            | backend/main.py                                                                                 |
| Scan pipeline     | Filesystem scan, ROM/component reconciliation, provider enrichment    | backend/handler/scan_handler.py                                                                 |
| API boundary      | Request validation, scopes, delegation and serialization              | backend/endpoints/                                                                              |
| Catalog aggregate | ROM identity, metadata, files, PC components, media, saves and states | backend/models/rom.py                                                                           |
| Storage boundary  | External read-only versus ZockArchive-owned roots                     | backend/handler/filesystem/storage_composition.py, backend/handler/filesystem/storage_policy.py |
| Metadata          | Provider clients, normalization, merge and priority                   | backend/handler/metadata/, backend/adapters/services/                                           |
| PC automation     | Guarded unique decisions and review queue                             | backend/handler/metadata/pc_automation.py, backend/models/pc_automation.py                      |
| Frontend shell    | Bootstrap, initial auth/config/heartbeat, themes and routes           | frontend/src/main.ts, frontend/src/PGDP.vue                                                     |
| Frontend data     | Pinia state and API/socket adapters                                   | frontend/src/v2/data/adapters/legacy/, frontend/src/stores/                                     |

## Pattern Overview

**Overall:** Layered service architecture with a shared ROM aggregate and explicit storage capabilities.

**Key Characteristics:**

- Thin endpoints delegate to handlers and typed schemas.
- Rom is the catalog aggregate. Folder-backed downloads use neutral persisted
  component groups and immutable manifest members without making a console game
  a PC install.
- The external library is read-only. Generated/uploaded content uses classified owned roots.
- Raw provider metadata is retained and normalized into common fields and provider-qualified facets.
- New frontend behavior belongs in frontend/src/v2/; v1 paths are frozen.

## Layers

**Presentation:** backend/endpoints/ and backend/endpoints/sockets/ contain routers, schemas and realtime events. They depend on auth, database, metadata and filesystem handlers.

**Domain/application:** backend/handler/ contains database CRUD, metadata, filesystem, scan, sync, netplay and Redis handlers. It is used by endpoints and tasks.

**Persistence/integration:** backend/models/, backend/alembic/ and backend/adapters/services/ contain SQLAlchemy models, migrations, typed provider clients and provider types.

**Frontend:** frontend/src/v2/, frontend/src/plugins/router.ts and frontend/src/v2/data/adapters/legacy/ contain routes, feature components, stores, composables and API/socket adapters.

## Data Flow

### Primary Request Path

1. frontend/src/plugins/router.ts loads a route and hydrates currentRom through the ROM API.
2. Axios sends /api/* with CSRF headers. backend/main.py applies CORS, upload limits, CSRF, authentication and Redis sessions.
3. A router validates the request and Scope, then calls a database, metadata or filesystem handler.
4. Handlers use SQLAlchemy, typed providers and explicit storage capabilities. Pydantic schemas form the response.
5. Pinia updates the view. Scan, sync, activity and logs use Socket.IO at /ws; netplay uses /netplay.

### Library Scan and PC Enrichment

1. backend/tasks/scheduled/scan_library.py or scan endpoints create bounded mapped commands.
2. backend/handler/scan_handler.py reads the external root, hashes files, persists Rom/RomFile, and reconciles PC layouts defined in backend/handler/filesystem/roms_handler.py. Every mapped scan uses its logical mapped path plus filename as the catalog identity, so a direct-folder rename cannot reuse an identically named ROM from a stale path.
3. RomComponent represents base, update, DLC, hotfix, language pack, extra,
   unresolved, or neutral folder entries. RomComponentManifestMember retains
   relative path, size, SHA-256 and missing-from-filesystem state.
4. pc_steam_enrichment.py resolves guarded Steam patches; pc_match_handler.py collects reviewable candidates.
5. pc_automation.py applies only unique guarded matches. Ambiguity or protected/manual targets enter pc_automation_queue.

After a ROM has been merged into the catalog, its completion fence remains active
through optional media publication and PC enrichment. A selected collection child
therefore retires its parent even when later non-critical work fails, while the
original scan error remains visible to the operation.

Scan-operation reads remain protected by the existing task scope and operation ownership checks. The operation projection exposes a compact, data-minimized snapshot for lifecycle polling and accepts an explicit validated result query only when the client opens the explorer. Every list, matching count, platform option, and actionable sample is scoped to the operation's current attempt; the result query uses bounded pagination, normalized name search, numeric platform filtering, and an allow-listed outcome filter. The snapshot never exposes host paths, raw worker checkpoints, or provider exception text. This lets the frontend show authoritative progress and a compact actionable summary without preloading an operation's rows.

The singleton execution slot remains owned until lifecycle reconciliation has
proved that the previous attempt can no longer write. Recovery requires an
idle owned-media verifier, a terminal RQ job state, and no RQ worker reporting
that job as current. A process restart may leave terminal RQ metadata without
an end timestamp, so that timestamp is never used as a substitute for the
terminal-state and worker-ownership fence. Browser restoration first asks for
the active slot, which prevents a completed operation saved in local storage
from obscuring an interrupted operation and its supported resume action.

### Metadata, Localization and Media

- Parent metadata is provider JSON plus roms_metadata and filter-oriented roms_facets in backend/models/rom.py.
- Components have RomComponentMetadata, preserving DLC/provider identity separately from the parent.
- Manual descriptions remain in `manual_metadata.descriptions`. Steam PC/Windows and ScreenScraper console descriptions retain validated language/source variants. English may be collected alongside the requested language, but stays in its English slot. A ROM with an IGDB identity may expose its persisted IGDB English summary as an explicit IGDB fallback; unrelated scalar legacy summaries remain historical data and are not an active v2 description fallback.
- `backend/config/scan_language.py` updates the existing shared language priority using administrative permission and compare-and-set checks. `backend/handler/metadata/metadata_locale.py` captures the effective locale into accepted scan commands; queued, scheduled and recovered work retains that snapshot.
- `backend/handler/scan_description_retry.py` shares the existing retry coordinator across unidentified and missing-description work. It selects at most five distinct games per operation and eight existing targets per game. Complete warm targets need no provider request; description-only repair avoids inventory and media work.
- `backend/handler/database/description_state.py` applies narrow provider-text patches with current identity, version/digest and execution-authority checks. Partial provider replies preserve valid variants and all stored manual text. Existing interactive matching and refresh paths use `backend/handler/metadata/manual_description_refresh.py` and the same provider/merge owners.
- Library images are RomComponentLocalMedia; uploaded/provider media is copied to owned resources as RomOwnedMedia or RomComponentOwnedMedia, with roles and placements. Manual IGDB matching retains the selected cover, screenshot and artwork inventory in IGDB metadata before legacy paths are generated. `handler/metadata/rom_media.py` then uses the same suppression-aware owned-media publisher to populate and later refresh the managed catalog.
- backend/endpoints/roms/media.py and backend/endpoints/roms/pc_component_resources.py expose owned media. The v2 detail view selects overview, background and audio placements. A normal parent `pc-metadata-selection` downloads one selected provider or scraper Cover through the bounded HTTPS owned-image store, preserving its verified GIF, WebP, JPEG, or PNG bytes and MIME as a parent-owned `cover` candidate. It then selects that exact row with the existing version-checked parent Cover mutation. The active hero reads `/api/roms/{rom_id}/media/{media_id}/content`, not a generated `path_cover_*` derivative. Component selection retains the corresponding component-owned candidate, and its detail hero reads `/api/roms/{rom_id}/pc-components/{component_id}/media/{media_id}/content`; neither flow can substitute a sibling or parent row. The separate legacy provider/scraper cover downloader preserves an `image/gif` or `image/webp` large cover as validated raw bytes at a matching `.gif` or `.webp` resource path, so its assets-backed hero receives the real MIME and can animate. Its small preview and other static cover inputs retain the existing generated derivatives. Header and decoded-image formats must agree before publication. Generated static thumbnails remain valid for legacy/list use, but do not replace an active owned hero source. Migration 0146 records an existing current cover only for rows whose original-source fields were all absent, preserving recoverable legacy media without creating assets or changing selected candidates. A legacy static derivative without a retained original URL or path is irrecoverable and must not be advertised as an original.

### Provider image deletion and placement

Deleting parent provider media keeps its catalog identity as a tombstone with
`operator_suppressed=True`, removes its placements and clears its owned path.
Normal, media-only, COMPLETE and explicit provider refresh preserve this intent.
Automatic inventory disappearance instead uses a tombstone with
`operator_suppressed=False`; that candidate may return with a later inventory.
Uploads retain their separate deletion and placement behavior.

`backend/handler/database/provider_media_suppression.py` shares the persisted
suppression policy between optimistic download filtering and locked reconciliation.
Exact native IDs remain provider-qualified. Identical `url-sha256:` identities
also match across existing provider namespaces, only within the same ROM and role.
The digest comes from the existing normalized HTTPS URL. Native records without
a comparable persisted URL identity cannot be reconstructed or aliased by guessing.

Generic and Steam refresh batch suppression checks before downloading or storing
images, including Steam COMPLETE force updates. Repository reconciliation checks
again under the existing ROM version/parent lock and scan write fence. Legacy
cover/screenshot publication filters attempted downloads without changing stored
metadata URL lists. Filtered screenshots are regenerated together so their returned
paths retain their download order, without reusing paths indexed by the original
unfiltered list. Suppression is rechecked under the publication transaction's parent
lock and fence before staged output publication and again before association.
A deletion during download rejects that attempt; the existing batch abort removes
its private outputs. Publication failures retain the existing recovery protocol.
The bounded receipt walker preserves its advisory directory cursor, but a resumed
cursor that reaches its end makes one fresh pass within the same fixed step budget.
This promptly discovers a newly terminal crash receipt without weakening manifest,
content-proof, ownership, or scan-write-fence validation.
If a receipt directory disappears after its entry was read, the walker restarts
that bounded directory pass instead of trusting the invalidated directory cookie,
so later sibling receipts remain reachable.
Recent terminal scan attempts are also reconciled directly before the generic
walk. That priority path is limited to the normal receipt budget and performs
the same manifest and ownership checks, so an older cursor cannot defer a
current crash receipt behind live batches.

Removing a placement leaves an active candidate in the catalog. Steam inventory
reconciliation can seed empty overview/background surfaces again, so placement
removal is not a durable hide flag. There is no independent per-media hidden state
or restore endpoint. Explicit refresh does not restore operator-deleted images.

### Saves, States and Downloads

- Save and State are user-owned ROM assets with retained catalog identity, device linkage and visibility. Handlers are backend/handler/database/saves_handler.py and states_handler.py. SaveBackup is a separate owner-scoped ZIP aggregate; it validates archive topology without extraction and treats Windows restore paths as metadata only.
- Device save synchronization uses backend/models/device_save_sync.py and backend/models/sync_session.py.
- Folder-download selection snapshots immutable evidence from persisted,
  scanner-created manifest members in backend/models/download_manifest.py. A
  complete folder inventory creates one neutral eligible group for a whole-folder
  request, while component, archive-set, and selected-member requests keep their
  existing scopes. The manifest endpoint first verifies ROM visibility, resolves
  whole-folder membership server-side under the ROM and component locks, then
  returns a bounded 409 rejection code when the inventory is stale, incomplete,
  duplicated, missing, or otherwise unavailable. It never returns a partial
  folder. Absent or non-visible ROMs still receive the generic manifest 404.
- Manifest IDs and member IDs are opaque and user-scoped. The member stream
  rechecks ROM visibility, manifest validity, source identity, snapshot evidence,
  and safe relative-path resolution before it opens a file. The browser cannot
  supply a source-library path or enumerate persisted member rows.
- Resumable transfer attempts, item states and event lineage live in backend/models/download_transfer.py; endpoints are backend/endpoints/download_manifests.py and backend/endpoints/download_transfers.py.
- Source changes invalidate manifests/transfers. The frontend consumes them via frontend/src/v2/data/adapters/legacy/services/api/downloadTransfers.ts.

**State Management:** SQLAlchemy and Redis hold backend state. Pinia holds frontend server state, route query parameters hold bookmarkable filters/tabs, and component/store state holds ephemeral UI. Language and UI preferences use frontend stores and useUISettings.

## Key Abstractions

**ROM aggregate with folder-download groups:** A parent Rom owns cascading
components and manifest members. PC-specific component metadata, media, and
notes remain attached only to their appropriate install groups; a neutral folder
group carries no PC classification and provides the shared folder-download
capability. See backend/models/rom.py, backend/handler/scan_handler.py and
frontend/src/v2/components/GameDetails/PcComponents.vue.

**Storage descriptors and grants:** Composition-owned immutable descriptors authorize operations before path opening. See backend/handler/filesystem/storage_composition.py, storage_access.py and storage_policy.py.

**Mapped PC downloads:** `endpoints/roms/files.py` resolves a catalog file against the platform-owned storage mapping before opening it. PC file rows are game-relative, so the resolver prefixes the ROM filesystem path for both ordinary game members and local `OST`/Soundtrack media; it then opens only the mapping-relative suffix through the existing descriptor and permission boundary.

**Provider normalization:** Typed adapter, provider handler, merge/priority policy and response schema preserve raw evidence while exposing common/localized fields. See backend/handler/metadata/steam_merge.py, rom_media.py and backend/models/rom.py.

**Frontend v2 tiers:** Domain-free primitives live in frontend/src/v2/lib/, shared composites in frontend/src/v2/components/shared/, and feature composites in frontend/src/v2/components/GameDetails/ or another feature folder.

## Entry Points

- FastAPI: backend/main.py, invoked by Uvicorn/Gunicorn or direct Python.
- Background work: backend/startup.py, backend/tasks/, backend/handler/redis_handler.py.
- Frontend: frontend/src/main.ts and frontend/src/PGDP.vue.

## Architectural Constraints

- **Threading:** Async FastAPI/Socket.IO coexist with RQ workers; blocking I/O stays in handlers/tasks.
- **Global state:** Provider handlers, config manager, Redis clients, Socket.IO handlers and storage composition are module-level infrastructure.
- **Circular imports:** The Axios client imports the router for 401 redirects. PGDP.vue lazy-loads app-shell pieces to avoid bootstrap cycles. V2 primitives must not import stores, services, router or i18n.
- **Storage safety:** The library root is external/read-only. Never write sidecars, exports or generated media there.
- **API contract:** Backend response schemas are authoritative; changes require OpenAPI regeneration into frontend/src/**generated**/.
- **Compatibility:** Do not refactor frozen v1 paths.

## Anti-Patterns

### Business logic in endpoints

**What happens:** Routes query/mutate catalog state or implement provider/filesystem decisions inline.
**Why it's wrong:** Shared transaction, storage-policy, concurrency and response rules are bypassed.
**Do this instead:** Add a focused handler under backend/handler/database/, metadata/ or filesystem/.

### Treating PC components as independent ROMs

**What happens:** DLC/update paths become unrelated catalog records or files are flattened into the parent.
**Why it's wrong:** Install topology, manifest identity, component media and parent-qualified matching are lost.
**Do this instead:** Use RomComponent and RomComponentManifestMember under the parent Rom.

### Writing to the external library

**What happens:** Covers, uploads, exports or transformations write beside library files.
**Why it's wrong:** The archive must remain unchanged and storage policy rejects external mutations.
**Do this instead:** Use fs_resource_handler and owned storage descriptors.

## Error Handling

**Strategy:** Validate and authorize at the boundary, raise typed domain/storage exceptions, translate at endpoint/middleware boundaries, and preserve optimistic concurrency conflicts.

**Patterns:** protected_route and assert_rom_visible enforce access; guarded mutations return None and endpoints map that to 404 or 409; StoragePolicyDenied remains terminal; failed media mutations clean up owned files and scheduled cleanup retains deletion intents.

## Cross-Cutting Concerns

**Logging:** Structured logging in backend/logger/; admin log lines can be forwarded over Socket.IO.

**Validation:** Pydantic schemas, auth scopes, bounded paths, typed provider data and database constraints.

**Authentication:** backend/handler/auth/hybrid_auth.py supports session, basic, bearer/client-token and OIDC, composed with CSRF/session middleware in backend/main.py.

**Localization:** frontend/src/locales/ loads locale/namespace JSON via frontend/src/locales/index.ts; en_US is source, while provider/manual metadata localization is resolved in v2 composables.

---

Architecture analysis: 2026-10-15.

## Backend-specific current contracts

### API and download surfaces

The REST routers are included under /api in backend/main.py. Current central areas are /auth and /users, /platforms, /roms, /collections, /search, /music, /saves, /states, /screenshots, /firmware, /devices, /sync, /storage, /tasks, /config, /heartbeat, /stats, /logs, /streaming, /export and /feeds. PC-specific routes are implemented in backend/endpoints/roms/pc_metadata.py, pc_component_resources.py and pc_automation.py. Download manifests are created by POST /api/roms/{rom_id}/download-manifests; member reads are under /api/download-manifests/{manifest_id}/files/{public_id}; transfer sessions are under /api/download-transfer-sessions. Chunked ROM upload is in backend/endpoints/roms/upload.py.

### Auth and permissions

Role is user or admin in backend/models/user.py. Admin bypasses the granular matrix. Users receive PermissionGroup grants and UserPermissionOverride changes for read, write and delete over catalog, assets, devices, playlists, firmware, users, tasks and logs. backend/handler/auth/hybrid_auth.py accepts Redis sessions, Basic, HS256 OAuth bearer tokens, hashed rmm_ client tokens, optional OIDC and optional kiosk read access.

### Database, Redis and storage

MariaDB is the default driver. MySQL and PostgreSQL are supported by backend/config/config_manager.py and Alembic. docker-compose.yml includes MariaDB for ZockArchive and a separate PostgreSQL service for Authentik. The production Portainer stack uses MariaDB 11.3 and Valkey-compatible Redis runtime state.

The image-only Portainer release stack exposes provider inputs using the runtime
names consumed by backend/config/**init**.py: `IGDB_CLIENT_ID`,
`IGDB_CLIENT_SECRET`, `MOBYGAMES_API_KEY`, and the `STEAM_API_*` family. Its
Compose mapping accepts matching legacy `ZA_`-prefixed inputs only as fallbacks, so
an explicitly configured runtime name wins. This compatibility boundary is limited
to the release stack and does not change the retained Git-source stack contract.

StorageRoot and PlatformStorageMapping in backend/models/storage.py model external_read_only roots and versioned platform mappings. A platform owns a deterministic, id-ordered collection of active mappings, so several non-overlapping direct Games children can share one platform without replacing one another. PlatformStorageMapping remains the durable owner of each normalized `(platform_id, storage_root_id, relative_path)` disposition, while SetupFolderExclusion in backend/models/setup_folder_exclusion.py owns the mutually exclusive explicit "do not scan" disposition for that direct root-relative path. Setup assignment locks and validates the root, rejects duplicate or overlapping resolved paths, preserves audit snapshots and optimistic mapping revisions, then reconciles every folder independently in one transaction. It never moves an existing mapping merely because a later folder selects the same platform.

The mapping scan coordinator emits one immutable MappedScanCommand per active mapping, in mapping-id order. A catalog path resolves to exactly one owner, and the mixed scan excludes every mapped platform route plus persisted setup exclusions from legacy fallback. Consequently a physical direct Games folder is scanned at most once. The 0148 migration only removes a surviving historical platform-wide unique constraint after dialect inspection. It preserves rows and audit history on MariaDB, MySQL, and PostgreSQL, and its downgrade refuses to restore singular uniqueness while plural platform data exists. After completed setup, `GET /setup/folders/assignments` gives an authenticated administrator a bounded current-discovery projection of every direct-folder disposition, including a pending suggested or excluded state for a newly discovered child. A changed direct-child inventory never reopens setup for an enrolled administrator. `POST /setup/folders/assign` atomically writes the current complete set and deactivates only vanished direct mappings during that explicit save, preserving an audit trail and avoiding stale scan paths. An administrator may explicitly replace an active direct mapping with `excluded`; the transaction deactivates that mapping before creating the mutually exclusive exclusion, and a later explicit platform selection creates a new mapping. Changing one active platform directly to a different platform remains a conflict. It is not the unrelated config-file exclusion list. backend/handler/storage/read_context.py validates mapping revision and root health. backend/handler/filesystem/storage_policy.py permits only resolve/list/stat/read/scan/hash/stream/download on external roots; writes go to classified ZockArchive-owned roots.

Archive member enumeration uses a no-output interval per extractor, not a total
byte-processing budget. A continuously streaming large 7z or RAR may therefore
finish, while a stalled extractor fails closed. The affected ROM retains a raw
container hash and no `archive_members`, and the existing scan-operation warning
records its game name without exposing a storage path. Other ROMs, mappings and
platforms continue, so an archive-member timeout alone does not fail the scan.
RetroAchievements extraction treats the same incomplete inventory as an absent
optional RA hash for that ROM; it never converts the evidence failure into a
platform-level scan failure.
ISO files take the ordinary file path. Windows folders such as FitGirl repacks
remain one nested ROM and their files are not content-hashed during discovery.
The Windows quick inventory is metadata-only (names, stat fields and bounded
directory traversal), while owned-content proof protects only ZA-owned staged
media and generated outputs, never library game bytes. Its finite byte-aware
proof budget consequently cannot terminate a PC library scan. An explicit PC
subfolder choice reclaims a same-named missing catalog child from an older
mapping before inventory reuse. It rebuilds that child's files at the active
mapping path and reaches the normal completion fence, which retires the chosen
parent before a later quick scan can rediscover and metadata-match it as a
separate game. The same recovery also applies to an ordinary missing Windows
game after an explicit direct-mapping rename, but only when an inactive mapping
on the same storage root yields the exact same mapping-relative game suffix.
It reuses the existing catalog row and rebuilds its PC files, including local
soundtrack rows, rather than creating a duplicate or guessing by display name.
A rejected
generated-media proof remains fail-closed: when the scan can associate it with
a ROM, it persists a failed result with the platform and game, increments the
owned-content timeout counter, keeps earlier results, and ends the durable
operation as failed after later work has completed. Recovery retains the
ambiguous owned-media receipt instead of publishing it.

Scan lifecycle recovery never clears the active execution slot directly. It
requires the owned-media verifier to be idle and every live RQ worker to deny
ownership before recovering a terminal or restart-orphaned `STARTED` attempt.
This distinguishes an RQ status record retained after a worker restart from a
live writer, preserving the fencing boundary while letting the existing recovery
flow release the stale attempt safely.

### PC models, metadata, DLC and descriptions

RomComponent and RomComponentManifestMember in backend/models/rom.py represent
base, update, DLC, hotfix, language_pack, extra, unresolved, and neutral folder
groups with relative paths, size, SHA-256 and missing-file state. The neutral
`folder` group exists solely when a scan has a complete folder inventory and is
the shared whole-folder download source for PC and console games. For PS3, the
same neutral group represents either a verified directory tree or exactly one
verified ISO member. A manifest request materializes missing PS3 inventory via
the existing bounded storage capability before the regular manifest handler
locks and captures it. It is not projected as a PC component or eligible for
PC metadata/media workflows. A
top-level `OST`/`Soundtrack` folder is intentionally projected both as local
soundtrack media and as an `extra` component: the former powers the Media player,
while the latter gives the ordinary, manifest-authorized download flow a
selectable folder and individual files. RomComponentMetadata, local media, owned
media, placements and notes preserve component-specific catalog data.
pc_match_handler.py collects review candidates from IGDB, Steam, MobyGames,
SteamGridDB and LaunchBox. pc_steam_enrichment.py applies guarded Steam data.
DLC matching is limited to related IGDB expansions or validated Steam DLC.
manual_description.py stores locale-keyed descriptions and resolves exact locale,
English and provider fallbacks.

Manual IGDB matching retains its complete cover, screenshot and artwork source inventory in `igdb_metadata.provider_media`. The explicit parent-media refresh chooses that retained provider inventory before legacy URL fields. For older manual matches that retain only a known IGDB id, it restores this inventory from that same provider record before reconciling screenshots and artwork. Provider-media suppressions remain durable and are checked before every candidate is republished.

#### DLC-owned manuals and media

`backend/endpoints/roms/pc_component_resources.py` exposes component resources
only below their resolved parent ROM: read routes require `roms.read` and
uploads, deletions, and placement changes require `roms.write`. The
`/{rom_id}/pc-components/{component_id}/manual` GET, POST, and DELETE routes
manage a DLC-owned PDF or Markdown manual; `/manual/content` streams only that
component's owned manual. The POST and DELETE operations require the component
`expected_version`, so a stale client cannot replace or remove the parent ROM's
manual or another DLC's manual.

The v2 DLC media navigation intentionally does not expose a manual tab. This is
a UI scope decision, not a storage migration: existing component manual paths,
files, and these compatibility routes remain intact, while the main-game manual
experience remains unchanged.

The same router lists, uploads, streams, deletes, places, and reorders
`RomComponentOwnedMedia` beneath `/media`. `overview` and `background` accept
image roles, while `soundtrack` accepts only soundtrack audio. The `surface`
field records independent ordered placements per component and surface, so a
DLC's selected overview, background, or soundtrack never aliases parent-ROM
media. `PUT /media/placements` replaces the complete ordered ID set for one
component-owned surface under the same `expected_version`; it rejects foreign,
missing, or stale placement members instead of changing a sibling DLC. Each
component image upload receives a collision-resistant owned path,
so retaining multiple gallery or screenshot rows cannot overwrite an earlier
file. Migration `0139_pc_component_owned_media_surfaces` adds the nullable
component `manual_path`, the placement surface, and the surface-specific
constraints/indexes needed for this separation.

`0145_preserve_original_cover_source` keeps a parent ROM's original legacy
cover paths and provider URL separate from an actively selected upload. A
cover upload therefore adds a candidate rather than replacing the source. The
selection mutation snapshots a reliable legacy source before changing the
active candidate and restores it if that candidate is deleted or the original
is selected. Rows that had already overwritten their source before the
migration are intentionally left empty when no reliable source remains.
Provider, scraper and upload cover candidates retain their own cover role,
including GIF and WebP source bytes. Selection uses those validated owned
bytes directly, so animation is not flattened into generated derivatives.

Original parent-ROM covers that predate the owned-media catalog are retired by
`DELETE /api/roms/{id}/media/cover/original`. The route requires ROM edit access
and the current `expected_version`. `ParentCoverMutationMixin` clears only the
retained original-source fields, preserving a separately selected upload, and
records URL-identity tombstones using the existing provider suppression rules.
Legacy cover downloads also honor those tombstones. Shared resource files are
retained rather than unlinked by this source-only operation, because an owned
candidate or another display surface may still reference them.

`pc_component_resource_support.py` centralizes upload role, extension, and MIME
validation. `handler/filesystem/pc_component_resources.py` writes accepted
manuals, images, and audio only into the ZockArchive-owned resource root.
`handler/database/pc_component_media_mutations.py` resolves the exact DLC,
applies version-checked manual, placement, and ordering mutations, and enforces
role-to-surface compatibility. The endpoint deletes a newly written owned file
when the guarded database mutation fails and removes replaced files only after
a successful commit. Response schemas stay in
`endpoints/responses/pc_component_media.py`; generic ROM handlers keep their
existing parent-media and provider behavior.

### Background work, WebSockets and deployment

RQ tasks are defined under backend/tasks/ and initialized by backend/startup.py, including scans, cleanup, provider updates, media cleanup, save-hash backfill and sync push/pull. /ws uses Socket.IO with Redis coordination for scan, activity, sync and admin log events; /netplay provides room, WebRTC and input relay events.

The retained Git-source Portainer contract is `examples/portainer-stack.yml`. It builds `docker/Dockerfile`, persists MariaDB, resources and Redis data, mounts `/romm/library` read-only, and mounts operator-owned assets and config as writable paths. Required Portainer secrets include `PGDP_DB_PASSWORD`, `PGDP_DB_ROOT_PASSWORD` and `PGDP_AUTH_SECRET_KEY`. The exact host paths are deployment-specific.

The independent image-only Portainer contract is `examples/portainer-release.yml`. It pulls a reviewed GHCR release image instead of building source and uses separate `ZA_*` variables. MariaDB, `za_resources`, Valkey, assets and configuration have named volumes by default. Only `ZA_LIBRARY_PATH` is required and mounted at `/romm/library:ro`; advanced operators may replace the assets or configuration volume with an explicit writable host path. The stack does not mount the Docker socket. These boundaries keep catalog, cache, managed resources, configuration, assets, and the source library under distinct ownership.

The image-only stack sets `REDIS_HOST=za-valkey` and `REDIS_PORT=6379`, selecting the external health-gated Valkey service instead of the image's internal fallback. The established application entrypoint remains responsible for waiting on its dependencies, applying Alembic migrations, and presenting browser first-user setup for an empty database. Portainer and Compose provide configuration and service dependency wiring; the application container owns migration and setup behavior; MariaDB, Valkey, named volumes, and operator bind mounts own durable state.

### Configuration and verification

env.template is the canonical environment list. backend/config/**init**.py loads database, Redis, auth, OIDC, provider, Steam language, scan, upload, sync and observability variables. ROMM_AUTH_SECRET_KEY is required at import time. Tests live in backend/tests and cross-dialect/storage checks are in backend/tools. The disposable Phase 34 runner keeps process orchestration in phase34.py, with teardown authority in phase34_cleanup.py and validated test selection/execution in phase34_execution.py. It verifies all labelled resources and every volume mounted by its verified containers before teardown, then runs `docker compose down --volumes` only with its generated `pgdp34-<token>` project. It re-inspects those known volume names after teardown, covering anonymous SQL and Redis image volumes without pruning or modifying any durable stack, and records that no project volumes remain.

## Product display and retained identities

The API documentation title and visible log prefix use ZockArchive. Both the API
process and startup task process report Sentry releases as `za@<version>`. This
starts a new release-name series for release-based dashboards and comparisons;
the configured DSN, Sentry project, credentials and capture behavior are unchanged.
The logger remains `romm`, with the existing formatter configuration key `pgdp`,
Redis channels and admin-log transport. Product labels do not rename these
installation or integration identities.

`TINFOIL_WELCOME_MESSAGE` keeps its operator key and configured-value precedence.
Only its fallback welcome is ZockArchive Switch Library. Existing custom and
legacy-branded configured welcomes are not migrated. Configuration warnings and
broker connectivity guidance use the current product name; broker failures keep
their existing HTTP status and session-owner authorization rules.

WebRcade feed titles/descriptions, Kekatsu author metadata and the ES-DE scraper
display name use ZockArchive. Feed routes, serialization fields, scopes and
download URLs are unchanged. FPKGi synthetic title IDs retain the `ROMM` prefix
so related content stays grouped; Pegasus retains `x-romm-id` for round trips.
WebRcade artwork URLs still reference upstream RomM assets pending final supplied
artwork. Metadata-provider User-Agent strings and upstream endpoints retain their
provider-compatible identities. No stored library, operator configuration,
authentication, session, cache, schema or filesystem identifier is migrated.

### Owned identity-transition validation

The rebranding probe in backend/tools/phase38_probe.py composes the existing disposable SQL/Redis runner, snapshot fixtures, target labels and exact cleanup. Its source adapter requires the canonical Linux host, root, feature branch and planning markers plus an authenticated live GitHub numeric/node ID and exact current name/origin pair. Inherited database, Compose and disposable-target overrides fail closed. This adapter does not change CI repository authority. Backend defaults to every tracked SQL-profile CI shard; the affected profile is a fixed product-identity test list. Schema uses the existing upgrade/downgrade/re-upgrade and constraint checks. Focused local receipts do not fulfill the final complete dual-SQL CI requirement.

The installation proof uses a committed clean clone for the existing fresh-stack verifier. Populated validation builds the original and current Dockerfiles with unique local tags, then composes the existing production-stack adapter with the same labeled disposable SQL, Redis and owned resources. Synthetic account settings, catalog/mapping identities, schema, resource/source bytes and cache sentinels are compared as hashes before and after restart. Authentication, scoped denial and mapped downloads use actual HTTP. A generated blank cartridge is confined to the owned immutable source fixture; the full production image supplies the actual local EmulatorJS runtime for browser bootstrap. No production volume adoption or live Portainer access is part of this proof.

### SQL and complete-checkout CI contracts

The complete tracked backend test selection follows backend/pytest.ini patterns.
backend/tools/ci_test_profiles.py partitions that selection into disjoint SQL
and host profiles with an exact union. Missing required host suites or duplicate
selection fails before a runner starts. SQL shards retain all remaining tests,
including disposable-authority, installation-helper and cutover-verifier tests.

The four metadata, operator-documentation, publication and fresh-clone verifier
suites require the complete repository and host Git, Node24 and Docker Compose.
The required host-contracts job in pytest.yml runs them with Python3.13 on the
Actions host, without app dependencies or a database. Compose only renders
configuration; it does not create services. The SQL image and snapshot remain
narrow and never mount a Docker socket. Both the SQL runner and full rebranding
probe consume the same profile partition.

Host artifacts retain exact Git source manifests, complete all/SQL/host file
membership, prerequisite versions and per-file unittest counts/results. The final
cutover validator requires this successful current-source host proof plus all16
dual-SQL shards and three schema roundtrips. A missing host artifact, stale
source, changed membership or skipped suite cannot be classified as acceptance.
See docs/repository-cutover-verification.md for the receipt contract.

### Searched covers in the standard ROM edit dialog

The standard `PUT /api/roms/{id}` edit path catalogs submitted HTTPS cover
sources, including the Edit > Search cover > Apply flow. The endpoint defers
cover publication until the full form has been prepared. `edited_cover.py`
owns the persistence/error/cleanup boundary and prepares or reuses a candidate
by normalized provider URL; the existing provider
identity is retained when a matching catalog entry already exists.
`handler/filesystem/searched_cover.py` uses the existing validated streaming
cover downloader at a unique owned-media destination, preserving GIF, WebP and
APNG animation without overwriting legacy original-cover files.
`handler/database/edited_cover.py` performs the owner-version check, candidate
reconciliation, cover selection and remaining form update in one transaction.
A conflicting or failed edit removes only its newly staged file. Repeated Apply
reuses the candidate. Ordinary candidate selection changes references only;
it does not generate first-frame derivatives or write shared legacy cover paths.

Decomposition: the legacy ROM route module remains large. This change replaces
its cover-download branch with a narrow dispatch; source preparation, streaming
storage and transactional publication live in three focused modules. Extracting
the entire multi-provider edit route is a separate boundary and is not required
for this correction.

The resource handler delegates retained-cover resolution and original-source
suppression to `handler/filesystem/cover_lookup.py`. It invokes the original
handler instance, preserving its storage capabilities and size-specific path
lookup. This keeps both legacy modules below their pre-change line counts.
