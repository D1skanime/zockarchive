# Phase 49: ZA Beta14 Upgrade without Download Inventory Repair - Context

**Gathered:** 2026-11-25
**Status:** Ready for planning
**ki-run job:** `261125-bafa`
**Release baseline:** `be0e4ee888d58008f19f8eb1fbd7ee929cbe676a`

<domain>
## Phase Boundary

Repair the safe existing shared Game Download lifecycle for upgraded libraries
whose eligible ROMs have persisted `RomFile` facts but no newer
`RomComponentKind.FOLDER` inventory. The repair must make the existing PC
dialog, queue, and manifest transport reachable after bounded authorized
preparation, without claiming unverified files are transfer-ready or changing
ordinary small-download behavior.
</domain>

<decisions>
## Implementation Decisions

### Upgrade reproduction and evidence
- Reproduce first on a disposable fixture rooted at the exact Beta14 release
  baseline, with a realistic PS3 folder game containing many synthetic small
  files and persisted `RomFile` rows but no FOLDER component or manifest data.
- Include an existing PS3 ISO and another platform at, above, and below the
  inclusive 4,000,000,000-byte boundary without new inventory, plus unknown,
  unreadable, stale, unauthorized, and path-boundary cases.
- Never use, reset, or change production databases, NAS data, existing Dev
  accounts, or permanent Docker resources. Do not seed a FOLDER component to
  make the upgrade case appear successful.

### Shared downloader lifecycle
- Preserve one common downloader, dialog, queue, resolver, inventory builder,
  manifest issuer, and transfer path. Do not add a PS3- or upgrade-specific
  engine, transport, hash path, or filesystem bypass.
- Keep detail projection cheap: it may publish only safely known readiness, and
  must not start a library walk, hashing pass, or unbounded materialization.
- Let the existing explicit, authorized shared-download action perform bounded
  preparation only after visibility, path, version, and known-size eligibility
  checks. The action must keep existing loading and error states.
- Materialize a verified FOLDER component from the current mapped source only
  through the established bounded builder. Do not manufacture a manifest or
  label a legacy `RomFile` set as verified without source checks.

### Compatibility and security
- Retain existing PC, PS3, ISO/single-file, ordinary small-ROM, permission,
  source-staleness, manifest snapshot, member delivery, and storage-policy
  behavior.
- The shared capability remains platform-neutral only for authoritative known
  sizes at or above the threshold; unknown sizes stay unavailable rather than
  inferred.
- Update the inaccurate `ensure_*` contract comment and affected backend and
  frontend architecture documentation in English.

### Verification boundary
- Before human UAT, add, change, and run no automated tests or full suites.
  Use isolated one-off reproduction evidence, static inspection, typecheck,
  scoped lint, and production build only.
- Human Dev UAT performs browser verification on desktop and mobile. The final
  handoff names routes, intended controls, and expected outcomes without
  claiming browser evidence created by this job.

### the agent's Discretion
- Choose the smallest existing-lifecycle seam that can expose a preparing
  shared-download action without making a detail GET mutate source state.
- Choose the bounded fixture scale and temporary harness implementation so it
  proves the migration condition while preserving cleanup and secret rules.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GameDetails.vue` already derives the Game Download tab from
  `folder_download` and existing component data.
- `create_download_manifest()` already owns visibility enforcement and the
  manifest hand-off to the immutable database handler.
- `build_folder_download_component()` and the scan-folder-download lifecycle
  already own safe component construction and complete member inventory.

### Established Patterns
- `shared_download_capability()` only publishes a capability for exactly one
  persisted, complete FOLDER component with present members.
- `ensure_shared_download_inventory()` is currently aliased as the PS3 helper,
  but only rejects missing inventory rather than materializing it.
- Shared-download eligibility is server-owned and threshold based, with no
  client path selection.

### Integration Points
- The detailed-ROM response must distinguish an eligible legacy source that is
  preparable from a transfer-ready FOLDER inventory without creating a second
  download surface.
- Manifest creation is the explicit request boundary that can authorize and
  perform bounded preparation before immutable manifest issuance.
- Backend and frontend architecture documents describe the reusable
  downloader, capability, and detail-tab contracts.
</code_context>

<specifics>
## Specific Ideas

The production symptom is Uncharted Drakes Fortune on PlayStation 3: ordinary
header download is present, `RomFile` count is 564, but the Game Download tab
is absent after Beta14 upgrade because no FOLDER inventory exists.
</specifics>

<deferred>
## Deferred Ideas

No production rescan, database reset, NAS mutation, release replacement,
merge, push, or new downloader engine is in this phase.
</deferred>
