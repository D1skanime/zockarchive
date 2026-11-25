---
id: 20261125-beta15-isolated-download-proof
status: incomplete
date: 2026-11-25
scope: disposable-harness-and-evidence
---

# Isolated Beta15 runtime and browser proof

The retained disposable stack established normal PS3 `RomFile` rows with zero
`FOLDER` rows, then reached the existing v2 tab and dialog on desktop 1440 and
mobile 390. The desktop standard queue issued the normal manifest POST and
downloaded `PS3_DISC.SFB` through its attributed transport URL; screenshots,
the downloaded bytes, and token-redacted runtime output remain under the job
temporary evidence directory.

The runtime also exposed a genuine ISO-shaped legacy representation: its only
`RomFile` uses `file_path == "."`, so `Rom.has_simple_single_file` is false
despite the direct-file source. Shared-download preparation now recognizes that
strict one-file form and dispatches it to the existing single-file builder.
No second resolver, manifest, queue, or transport path was added.

Phase 49's earlier baseline receipt remains the evidence for the initial migration state: 3,076 synthetic legacy RomFile facts with zero FOLDER components, manifest members, and manifests. The fresh attempt started a separate disposable Phase34 stack, completed its synthetic Quick scan, and reached both browser profiles before the host ended the foreground command. The harness cleanup then removed its temporary stack and partial evidence.

The older isolated helper output contains screenshots, sanitized detail snippets, and two 33-byte synthetic direct downloads selected through the download control rather than a copy-link control. It is reference material only, not a fresh Beta15 assertion.

The retained stack is registered in `ki-uat-keep.txt` for follow-up inspection.
