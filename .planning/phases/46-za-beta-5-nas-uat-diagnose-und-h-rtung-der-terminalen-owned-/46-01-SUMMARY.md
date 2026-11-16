---
phase: 46-za-beta-5-nas-uat-diagnose-und-h-rtung-der-terminalen-owned-
plan: "01"
status: partial
completed: 2026-11-16
---

# Phase 46 Plan 01 Summary

## Delivered

The archive-evidence part of the plan is implemented. The 7z member reader now
uses the existing archive-wide deadline for interruptible pipe reads and reaps
the exact extractor on deadline expiry. An incomplete member inventory raises
`ArchiveReadError`; it is recorded as an archive-specific incomplete-evidence
failure and cannot be represented as a complete inventory.

The scan worker catches that integrity failure per selected platform, preserves
the failure, continues with the remaining selected platforms, and marks the
operation failed after all selected platforms have been considered. This keeps
unverified content from becoming a successful scan while retaining progress for
unrelated platforms.

The documented disposable harness used an actual temporary 7z archive and a
deliberately sleeping extractor. Its failed run recorded Windows, Wii, and Xbox
in one operation, emitted the Wii archive timeout, and continued to Windows and
Xbox. With the normal extractor restored, a second run completed for the same
three platforms. The temporary authenticated browser inspection rendered the
scan page, quick-scan controls, and live-progress card over local HTTP. All
temporary harness resources were removed afterwards.

`py_compile` for the touched backend modules, frontend typecheck, and
`git diff --check` passed. The production frontend build remains blocked in the
existing PWA Workbox generation step because it has neither matched precache
files nor runtime caching configured. No test or test suite was created or run.

## Not Delivered

The direct owned-publication path was found to discard its known byte size when
opening `content_proof_scope`. It therefore always gave the isolated verifier
the fixed two-second allowance, even though the verifier must re-read the full
file. `verify_owned_content` now passes its known size and one expected record
to the existing finite byte-aware budget. The existing 900-second cap, child
isolation, read-only descriptor check, full SHA-256, identity checks, and
nonce/operation/attempt echo are unchanged.

The archive and owned-proof timeouts are independent: archive extraction waits
on a 7z pipe before content publication; the proof child only receives an
owned read-only descriptor after staging. A 7z timeout can fail a scan but
cannot consume the proof child budget. The shared visible symptom was a timeout,
not a shared limiting resource.

Mixed scans now retain an archive failure from a mapped platform, continue the
legacy platform group, and raise the aggregate only after both groups finish.

Task 3 is complete only for the archive boundary and the available temporary
browser evidence. It cannot attest to the planned owned-proof browser classes
or a green production build.

## Commits

- `6f93b1923` safe incomplete archive evidence failure
- `1ee86bd12` enforce 7z extraction deadline
- `7eb2563d8` continue selected platforms after archive error
- `1eb3fe951` ensure worker-level continuation for all selected platforms
- `9a04300a0` and `c72c5d930` archive timeout UAT documentation
- `c4ca193c8` focused archive pipe reader extraction
