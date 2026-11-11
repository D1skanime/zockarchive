# Phase 44: ZA Setup Assistant Folder Exclusions and Platform Search - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning

<domain>
## Phase Boundary

The setup assistant must let an administrator mark any discovered direct Games
subfolder as "Do not scan" instead of mapping it to a platform. The disposition
must persist, be reversible by choosing a platform, allow setup to continue only
when every folder is mapped or excluded, and keep excluded folders out of
mapping-backed first and later scans. The folder and its files stay read-only.

The existing platform picker must expose a visible, case-insensitive text search
that finds Windows for `win`, while its fixed exclusion action stays visible
above filtered platform rows and works with pointer and keyboard input.

The phase also includes the already requested Docker init presentation change:
the startup banner and init prefix identify ZockArchive without changing version
output or startup behavior. Release, merge, push, tag, and deployment remain
outside this phase until explicit human approval.
</domain>

<decisions>
## Implementation Decisions

### Setup disposition
- Reuse the existing mapping-bound scan model. A direct folder has a durable,
  root-relative exclusion or an active platform mapping, never both.
- An exclusion is visible in its setup row and does not create, rename, delete,
  or traverse source content.

### Picker behavior
- Reuse `ZASelect`; do not create a parallel overlay.
- Keep "Do not scan" pinned and visibly separated from platform results even
  while a search query has no result.

### Verification
- Before human UAT, run no new tests and no test suite. Use static checks,
  typecheck/build, and truthful manual/browser evidence only when available.

### the agent's Discretion
- Technical implementation details follow the current storage, recovery, scan,
  v2 input, localization, and Docker init contracts.
</decisions>

<code_context>
## Existing Code Insights

The implementation already exists in commits `1293dd139`, `9a398b364`,
`647f17e37`, and `fb4f1afa8` on the job branch. It has not previously been
bound to a GSD phase. Planning must inventory this honestly and only schedule
remaining phase artifacts, verification, and genuine corrections.
</code_context>

<specifics>
## Specific Ideas

Live UAT uses `Gamevault` and `Gametools` as exclusions plus one Windows folder
selected after typing `win`; it then verifies an initial and later scan. Docker
UAT checks the ZockArchive banner, `[ZockArchive][init]` prefix, and version.
</specifics>

<deferred>
## Deferred Ideas

The approval-gated ki-run merge/push, GitHub prerelease creation, Actions
inspection, and GHCR verification remain deferred to explicit human approval.
</deferred>
