# Phase 51: ZA: Medien bei bestehender Zuordnung nachladen und bewusste Löschungen erhalten - Context

**Gathered:** 2026-11-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Repair the existing targeted manual-assignment and media-refresh lifecycle so an
unchanged provider identity can discover missing or newly available provider media.
The reconciliation must remain additive and per stable provider-media identity.
It must preserve the existing persistent suppression mechanism for explicitly
deleted provider media, manual uploads, selected cover and placements. This is
not a library-wide crawler, scheduler, migration, reset, or a new media
pipeline.
</domain>

<decisions>
## Implementation Decisions

### Refresh Scope
- An explicit reassignment to the same provider ID and an explicit media refresh
  both fetch the current provider catalog rather than returning early because an
  old catalog is non-empty.
- The existing manual assignment, provider discovery, publication and response
  lifecycle remain the only integration points. No background crawl or provider
  special case is introduced.
- IGDB legacy assignments are the first concrete regression target. Other
  supported manual providers follow the shared contract where their existing
  lifecycle already uses it.

### Candidate Reconciliation
- Reuse the shared provider candidate discovery and stable native identity or
  normalized URL candidate key. Keep usable existing candidates without a
  duplicate or unnecessary download.
- Add a missing, non-suppressed candidate, including one that failed a previous
  download and one newly added upstream since the last explicit refresh.
- Do not replace, remove or reposition manually uploaded images, chosen covers
  or existing placements while reconciling provider-owned media.

### Explicit Deletions
- Reuse `provider_media_suppressions` and its existing candidate-key/
  normalization behavior. Do not add a second tombstone implementation.
- A deliberately removed provider item stays suppressed across restart, same-ID
  reassignment and repeated refresh, including provider URL-size variants.
- An empty provider catalog is not treated as an explicit user deletion, and a
  suppression for one item never blocks unrelated provider candidates.

### Failure Reporting and Evidence
- Preserve the established error and partial-success mechanisms, distinguish
  provider lookup, download, storage, catalog publication and response errors,
  and leave retries possible when no suppression exists.
- Do not claim a successful media import merely because metadata assignment
  returned a ROM. Record isolated fixture/runtime evidence without production,
  NAS or secret access.
- Before live UAT, use only targeted runtime evidence plus typecheck, lint and
  build. Do not add or execute tests; post-acceptance direct logic tests remain
  a separate follow-up.

### the agent's Discretion
- Choose the smallest shared extraction needed to keep production files within
  repository size rules, preserving the endpoint-handler-layer boundaries.
- Select isolated fixture plumbing and exact error presentation that fit the
  existing product contracts.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `handler.metadata.rom_media.refresh_provider_owned_media` discovers and
  reconciles provider-owned candidates and already returns per-item failures.
- `discover_provider_media`, `db_rom_handler.get_provider_media_suppressions`
  and the provider candidate key normalize identities for suppression checks.
- `retain_igdb_media` and `publish_igdb` are the existing manual IGDB
  publication path; manual description refresh already identifies same-ID
  ScreenScraper and Steam updates.

### Established Patterns
- Endpoints validate and authorize, then delegate metadata and owned-resource
  work to handlers. Existing storage publication rechecks suppression before a
  staged resource becomes visible.
- Provider-owned media reconciliation is idempotent and must preserve the
  parent-owned ownership and placement boundaries.

### Integration Points
- `backend/endpoints/roms/__init__.py` handles manual metadata assignment and
  currently gates IGDB retained media on an ID change.
- `backend/handler/metadata/rom_media.py` prepares and refreshes the provider
  catalog, including the stale non-empty catalog behavior.
- The Media UI and existing refresh action consume the established ROM response
  and must not acquire a separate client-side refresh implementation.
</code_context>

<specifics>
## Specific Ideas

The confirmed example is an IGDB candidate for Mobile Suit Gundam Crossfire
(ID 7376), which currently exposes one cover and three screenshots. The target
name itself does not prove an exact provider match, and no production database
was inspected. Uncharted Drake's Fortune is an additional human-reported legacy
example, not a production-verification claim.
</specifics>

<deferred>
## Deferred Ideas

Post-acceptance direct API and logic tests for idempotency, suppression,
new candidates and error paths. No scheduled whole-library refresh is in this
phase.
</deferred>
