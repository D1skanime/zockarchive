# Phase 46: Beta 5 owned-content verification and archive timeout diagnosis - Context

**Gathered:** 2026-11-16
**Status:** Ready for planning

<job_binding>
## ki-run Job Binding

- **job_id:** `261116-ffb0`
- **phase_dir:** `.planning/phases/46-za-beta-5-nas-uat-diagnose-und-h-rtung-der-terminalen-owned-`
- **binding record:** `.planning/ki-run/261116-ffb0.json`
</job_binding>

<domain>
## Phase Boundary

Determine why a completed Dreamcast quick scan can fail in its terminal
owned-content verification after slow or interrupted archive reads, reproduce
both failure classes using disposable local data, and harden the runtime so a
valid scan completes while any incomplete archive or unprovable owned content
remains an explicit failed scan. The NAS, its archive data, its configuration,
and its running stack are out of scope.
</domain>

<decisions>
## Implementation Decisions

### Integrity and scan outcome
- Do not weaken source-library immutability, descriptor identity checks,
  digests, child-process isolation, or write fencing.
- An incomplete archive read must never be recorded as a successful complete
  scan. Its error must state the affected archive and failure class.
- A failed owned-content proof remains terminal for the operation. Improve its
  diagnosis and budget only when the proof itself still fully verifies bytes,
  digest, identity, and protocol.

### Timeout diagnosis
- Treat the two observed timeout messages as separate symptoms until local
  reproduction proves a shared limiting resource or timing assumption.
- Exercise slow and permanently blocked reads with disposable local fixtures,
  not NAS paths, databases, media, or production containers.
- Retain bounded timeouts. A slow valid owned artifact may receive a budget
  derived from the verified work, but a stalled child must still fail promptly.

### Browser and compatibility scope
- Keep the existing scan operation API, idempotency, provider priority and
  IGDB-only one-result behavior unchanged.
- Surface a concise actionable scan failure through the existing operation UI
  and preserve other platform scan behavior.
- Before live UAT, run only typecheck/build and a browser inspection of a
  disposable local setup. Do not add tests or run test suites.

### Documentation
- Update the backend architecture description for the terminal proof and
  archive-read failure boundary if its behavior changes.

### the agent's Discretion
Choose the smallest bounded proof-budget and error-classification change that
matches the existing scan lifecycle and leaves all security checks intact.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/handler/filesystem/owned_content_proof.py` owns the isolated
  descriptor verifier, deadline, and admission lock.
- `backend/utils/archives.py` gives each archive a shared bounded extraction
  deadline and raises `ArchiveReadError` for incomplete reads.
- `backend/endpoints/sockets/scan_platform_execution.py` converts terminal
  scan exceptions into the existing `scan:done_ko` operation path.

### Established Patterns
- Source storage is capability-restricted to read/scan operations.
- Owned writes use sealed staging files, an out-of-process SHA-256 proof, and
  scan-write fencing before publication.
- Per-item failures may be logged only where the caller can truthfully retain
  a valid overall outcome; terminal integrity failures are re-raised.

### Integration Points
- `ScanMediaBatch.publish_and_associate` creates the terminal owned proof for
  provider-produced resources.
- `FSRomsHandler` reports archive member failures while building scan file
  evidence.
- The v2 scan operation receives the server's terminal reason without changing
  transport contracts.
</code_context>

<specifics>
## Specific Ideas

Observed UAT evidence: eleven Dreamcast games were individually reported as
completed; the final title was identified at 09:53:10; the enclosing scan then
failed at 09:53:52 with `Owned content verification timed out`. Dino Crisis and
Virtua Cop 2 separately logged incomplete 7z reads due to extraction timeout.
IGDB-alone appeared once, without a `+1` duplicate. A transient browser
disconnect was observed but no causal link is assumed.
</specifics>

<deferred>
## Deferred Ideas

NAS performance tuning, archive replacement, changing global production
timeouts without isolated evidence, and release/deployment work are excluded.
</deferred>
