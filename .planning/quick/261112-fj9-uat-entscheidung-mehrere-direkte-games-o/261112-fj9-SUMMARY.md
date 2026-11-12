---
quick_id: 261112-fj9-uat-entscheidung-mehrere-direkte-games-o
status: complete
commits: [7c11af65c, 79096883b, 16438a22d]
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

## Isolated browser UAT

The retained disposable project is
`za-261111-98c5-261112-fj9-uat-my97pn`, available at
`http://127.0.0.1:32772`. The browser workflow used the exact menu path
`Settings -> Library Management -> Games` and only temporary fixture folders:
`Aster-261112-fj9`, `Beryl-261112-fj9`, and `Cinder-261112-fj9`.

- The setup picker visibly used the case-insensitive `win` search to select
  Windows for Aster. Beryl and Cinder were initially `Do not scan`.
- The first real browser scan completed with one game, and Search visibly
  showed exactly `Aster UAT 261112-fj9`. Beryl and Cinder were absent.
- In Library Management, Beryl was changed to Windows, saved, and reloaded.
  The visible dispositions were Aster Windows, Beryl Windows, and Cinder Do
  not scan.
- The later real browser scan visibly completed with two games. Search showed
  exactly `Aster UAT 261112-fj9` and `Beryl UAT 261112-fj9`, with Cinder
  absent. The two-game scan and catalog count demonstrate that neither active
  physical folder was duplicated.

The initial Beryl promotion exposed a recovery-path conflict. Commit
`16438a22d` permits an excluded child to become a new platform mapping while
retaining the conflict for changing an already active mapping. The focused fix
passed Python compilation with temporary bytecode output and `git diff --check`.
No tests were created or run.

Desktop/mobile screenshots and the sanitized report are under
`/home/d1sk/ki-run/data/jobs/za/261111-98c5/` with the `261112-fj9-` prefix.
The UI showed the ZockArchive header and `development` version. Sanitized
runtime observations retain the `[ZockArchive]` logger prefix, but this
isolated compose directly starts the backend and did not emit the exact
`[ZockArchive][init]` entrypoint prefix. No raw logs or credentials are stored.

## Retention

The exact token-labelled app, worker, database, queue, network, two volumes,
and temporary root remain for human acceptance. `/tmp/ki-uat-keep.txt` lists
only those allowed resources and the TMPDIR-relative temporary path. No
permanent service, NAS mount, Team4s resource, or stale UAT volume was used.
