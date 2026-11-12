---
quick_id: 261112-fj9-uat-entscheidung-mehrere-direkte-games-o
status: blocked
commit: 7c11af65c
---

# Multiple direct Games folders, execution handoff

The persistence and scan implementation is committed in `7c11af65c`. Active
PlatformStorageMapping rows are now plural and mapping-id ordered. The setup
transaction preserves an existing Windows mapping when another direct folder
is assigned to Windows, and retains the root lock, normalized-path validation,
overlap protection, optimistic versions, and audit rows. The reviewed 0148
migration conditionally removes only a surviving historical platform unique
constraint, never rewrites data, and refuses a lossy downgrade if plural rows
exist. MariaDB, MySQL, and PostgreSQL use SQLAlchemy inspection plus Alembic
batch DDL for that conditional operation.

The scan coordinator produces one immutable MappedScanCommand for every active
mapping in mapping-id order. Legacy fallback excludes mapped platform routes
and persisted setup exclusions, so each direct physical path has one route.
The completed administrator page remains `Settings -> Library Management ->
Games`; its ZASelect still supports case-insensitive `win` search, `Windows`,
and the fixed `Nicht scannen` action for pointer and keyboard input.

## Verification

- Python source compilation completed with `PYTHONPYCACHEPREFIX` in a
  temporary `261112-fj9` directory. No tests were created or executed.
- `npm run typecheck` passed.
- `npm run build` transformed 3,936 modules, then failed in the existing
  `vite-plugin-pwa` Workbox precache configuration because it found no files
  for precaching or runtime caching.
- `uv run alembic heads` could not load this host checkout because Alembic
  imports the runtime config and attempts to create `/app/romm/config/config.yml`.
  That container path is read-only on the host. No migration was applied.
- `git diff --check` passed before commit.

## UAT status

No isolated 261112-fj9 Docker stack, browser session, screenshot, or retained
resource was created. The checked-in compose file hard-codes the permanent
development container names (`pgdp-dev`, `pgdp-db-dev`, and `pgdp-valkey-dev`),
so it cannot satisfy the required fresh token-labelled isolation without a
separate reviewed disposable Compose definition. Consequently no browser URL,
first-scan Aster-only receipt, Beryl remap receipt, later Aster-plus-Beryl
receipt, Cinder exclusion receipt, banner/init-prefix receipt, or keep manifest
is claimed. The stale `za-261112-cr2-uat-mariadb-data` volume was not inspected
or modified.

## Deferred human UAT

Create a token-labelled disposable Compose definition with no fixed container
names and a temporary read-only fixture root, then perform the required browser
workflow at `Settings -> Library Management -> Games`. Retain only resources
whose names contain `261112-fj9`, record the usable browser URL here, and write
`/tmp/ki-uat-keep.txt` only if such a stack is retained.
