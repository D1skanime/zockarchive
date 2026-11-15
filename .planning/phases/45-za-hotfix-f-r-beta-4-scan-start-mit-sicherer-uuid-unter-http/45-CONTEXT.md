# Phase 45: ZA Hotfix for Beta 4 Scan Start with a Secure UUID over HTTP LAN - Context

**Gathered:** 2026-11-15
**Status:** Ready for planning

<job_binding>
## ki-run Job Binding

- **job_id:** `261115-a60d`
- **phase_dir:** `.planning/phases/45-za-hotfix-f-r-beta-4-scan-start-mit-sicherer-uuid-unter-http`
- **binding record:** `.planning/ki-run/261115-a60d.json`

This Phase 45 context belongs exclusively to the active ki-run job above. The
binding record and this context intentionally name the same job and phase path.
</job_binding>

<domain>
## Phase Boundary

Restore scan initiation from an ordinary HTTP LAN origin when `Crypto.randomUUID`
is unavailable, while retaining canonical UUID API values and secure browser
randomness. Cover the normal scan, subfolder scan, and operation mutations that
share the scan workflow. Do not weaken browser security, alter TLS settings,
or touch the existing NAS stack.

</domain>

<decisions>
## Implementation Decisions

### UUID source and compatibility
- Use the platform `crypto.randomUUID()` where it is available.
- Otherwise construct an RFC 4122 version-4 UUID from `crypto.getRandomValues()`.
- Do not use `Math.random()` or a non-cryptographic fallback. Fail visibly if
  secure browser randomness itself is unavailable.
- Preserve the existing UUID string representation and the `library-scan-`
  operation-key prefix.

### Scan workflow coverage
- Replace direct UUID creation in normal and subfolder scan starts.
- Replace direct UUID creation for cancel, resume, and failed-metadata retry
  idempotency keys, including adapter defaults.
- Do not change request payload fields, endpoint paths, scan selection, or
  status/recovery behavior.

### Pre-UAT evidence
- Create no new tests and run no test suite before human acceptance.
- Run typecheck and production build, then inspect an isolated HTTP LAN-IP
  stack in a browser with `randomUUID` unavailable.
- Prove a quick scan starts and completes without a console error. Keep no
  UAT resource unless it is explicitly recorded in `$TMPDIR/ki-uat-keep.txt`.

### the agent's Discretion
Choose the focused v2 utility location and documentation wording consistent
with the current frontend architecture.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useScanView` centralizes normal and subfolder scan request construction.
- `useLibraryOperation` owns scan-operation mutations and reuses adapter calls.
- `scanOperations` owns idempotency request-key serialization.

### Established Patterns
- The active UI is v2 under `frontend/src/v2/`, with strict TypeScript and
  aliases for imports.
- Scan actions surface operation failures through the existing recovery and
  snackbar flow.

### Integration Points
- `useScanView/index.ts` generates the initial operation identifier.
- `useLibraryOperation.ts` maintains one mutation key for retry-safe actions.
- `data/adapters/scanOperations.ts` supports direct adapter callers with
  default mutation keys.

</code_context>

<specifics>
## Specific Ideas

The defect was reproduced in Beta 4 at `http://192.168.235.100:8077/scan`.
Library data and saved mappings are already reachable. The fix is limited to
the canonical checkout and must not modify that NAS environment.

</specifics>

<deferred>
## Deferred Ideas

None, the work is a bounded compatibility hotfix.

</deferred>
