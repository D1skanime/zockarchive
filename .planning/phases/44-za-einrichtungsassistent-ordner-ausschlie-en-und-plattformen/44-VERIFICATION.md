---
phase: 44-za-einrichtungsassistent-ordner-ausschlie-en-und-plattformen
verified: 2026-11-11T15:39:17Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Complete setup with Gamevault and Gametools excluded, and map one Windows folder after searching for win."
    expected: "Excluded rows show Nicht scannen, unresolved rows still block Weiter, and the Windows choice works with pointer and keyboard input."
    why_human: "The interaction and visible layout require a browser with authentic discovered folders."
  - test: "Reload setup, replace one exclusion with a platform, restore it if desired, then run the first and a later scan."
    expected: "Exclusions persist, a platform selection clears its exclusion, and excluded folders never become scan inputs."
    why_human: "Durable recovery and scan dispatch require a real isolated setup and scan environment."
  - test: "Inspect a container startup log."
    expected: "The banner and init prefix identify ZockArchive and the version line remains present."
    why_human: "Runtime output cannot be established from shell syntax and static source inspection."
---

# Phase 44: ZA Setup Assistant Folder Exclusions and Platform Search Verification Report

**Phase Goal:** Administrators can complete setup with every direct Games folder either mapped to a platform or explicitly excluded, while the existing picker supports accessible text search and the Docker init output consistently identifies ZockArchive.

**Verified:** 2026-11-11T15:39:17Z

**Status:** Human UAT required. Static goal evidence is complete, but no browser, real scan, Docker runtime, persistent stack, or source-folder mutation was performed.

**Re-verification:** Yes. The prior pre-UAT record was converted into the structured goal-backward report required for the Phase 44 GSD binding. Product code was not modified.

## Phase Artifact and Attribution Check

The job binding contains exactly `job_id` and the relative `phase_dir`, and points to this existing phase directory. The phase has `44-CONTEXT.md`, a YAML-frontmatter plan with `wave: 1` and `depends_on: []`, `44-01-SUMMARY.md`, and this verification report.

The inspected implementation predates this phase-record commit. It remains correctly attributed to these prior commits:

| Commit | Actual delivery |
| --- | --- |
| `1293dd139` | Exclusion schema, assignment and recovery disposition contract, and mapping-backed scan boundary |
| `9a398b364` | Setup-row exclusion UI, searchable pinned ZASelect action, keyboard routes, and translations |
| `647f17e37` | Backend and frontend architecture documentation |
| `fb4f1afa8` | ZockArchive init banner and prefix presentation |

`f29e008ca` is planning evidence only. It does not claim authorship of the product changes above.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | A direct Games subfolder has one durable platform or exclusion disposition. An exclusion is recoverable, can be replaced by a platform, and does not mutate source content. | VERIFIED | `SetupFolderExclusion` has a root-relative uniqueness constraint. `SetupFolderHandler.assign` accepts the exclusive dispositions, persists exclusions in its transaction, deletes a matching exclusion for a platform assignment, and uses mapping validation rather than filesystem writes. `SetupRecoveryHandler.saved` returns excluded dispositions. |
| 2 | Setup accepts every discovered folder when mapped or excluded, but rejects unresolved folders. | VERIFIED | `Setup.vue` emits every non-empty platform or exclusion into `assignments` and only enables progress when its count equals discovered folders. `SetupFolderHandler.assign` rejects a request whose supplied names are not exactly the discovered set. |
| 3 | The ZASelect platform picker exposes visible case-insensitive search, finds Windows for `win`, and retains separated keyboard and pointer access to `Nicht scannen` even with no matching platforms. | VERIFIED | `SetupStepPlatforms.vue` uses `searchable`, a translated `pinnedActionLabel`, and the `pinned-action` event. `ZASelect.vue` filters lower-cased titles, renders the pinned row before the filtered list and empty state, and routes Enter, ArrowUp, and ArrowDown through index `-1` to the pinned action. |
| 4 | Docker init identifies ZockArchive without removing version output or startup functions. | VERIFIED | `docker/init_scripts/init` has ZockArchive banner text and `[ZockArchive][init]` prefixes. The unchanged `python3` version command, `run_startup`, `start_bin_gunicorn`, and `start_bin_nginx` functions remain present. `bash -n` passed. |
| 5 | Pre-UAT validation does not fabricate test or runtime evidence. | VERIFIED | The summary records static, typecheck, locale, build, and shell evidence only. This verifier created no tests and ran no test suite, browser session, scan, service, or Docker stack. |

**Score:** 5/5 truths verified by static source and artifact evidence.

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `backend/models/storage.py` | Durable root-relative exclusion | VERIFIED | `SetupFolderExclusion` is a substantive SQLAlchemy model with root/path uniqueness and a cascading root relationship. |
| `backend/handler/setup_folder_handler.py` | Exclusive setup disposition reconciliation | VERIFIED | The handler validates every discovered folder, writes exclusions transactionally, removes an exclusion on platform selection, and only creates mappings for platform dispositions. |
| `backend/handler/setup_recovery.py` | Persisted exclusion recovery | VERIFIED | Recovery queries exclusions, serializes `disposition="excluded"`, and treats an excluded row as resolved rather than missing. |
| `frontend/src/v2/components/Auth/SetupStepPlatforms.vue` | Visible per-row exclusion and search-enabled picker | VERIFIED | The wired `ZASelect` receives `searchable`, the pinned translated action, selected exclusion display text, and its event handler. |
| `frontend/src/v2/lib/forms/ZASelect/ZASelect.vue` | Filter and pinned action interaction contract | VERIFIED | The component contains live search state, normalized case-insensitive filtering, pinned action rendering, and keyboard plus pointer activation. |
| `docker/init_scripts/init` | ZockArchive init presentation | VERIFIED | Branding changed only in the presentation functions; syntax is valid. |
| `.planning/ki-run/261111-98c5.json` | Job to phase binding | VERIFIED | JSON has exactly the required keys and targets the relative Phase 44 path. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `SetupStepPlatforms.vue` | `ZASelect.vue` | `searchable`, `pinnedActionLabel`, `pinned-action` | WIRED | Props and event are passed at the only setup row picker call site; the select defines and renders them. |
| `Setup.vue` | assignment API | serialized `excluded` or `platform` disposition | WIRED | The computed assignment converts `SETUP_EXCLUDED` to `excluded` with a null platform and filters only unresolved platform rows. |
| setup recovery | exclusion model | saved disposition query | WIRED | Recovery reads `SetupFolderExclusion`, emits it in saved assignments, and the frontend maps it back to `SETUP_EXCLUDED`. |
| setup assignment | scan dispatch | active `PlatformStorageMapping` only | WIRED | Excluded dispositions create no mapping. `execute_mapped_scan` requires a mapping id and revision through `MappingReadContext`. |

### Data-Flow Trace

| Artifact | Data variable | Source | Produces real data | Status |
| --- | --- | --- | --- | --- |
| `Setup.vue` | `folderDraft` | `/setup/folders` discovery and recovery snapshot through `setupApi` | API data is merged into the visible rows and serialized back to assignments | FLOWING |
| `SetupStepPlatforms.vue` | `props.draft` | Parent `folderDraft` update event | A pinned action writes `SETUP_EXCLUDED`; platform selection writes the slug | FLOWING |
| `ZASelect.vue` | `internalSearch` and `filteredItems` | Visible `ZATextField` input | Lower-cased query filters actual normalized picker items | FLOWING |

## Static Checks Performed

| Check | Result |
| --- | --- |
| Phase binding JSON schema and relative target check | PASS |
| Required phase artifact and YAML `wave`/`depends_on` inspection | PASS |
| Prior-commit identity and changed-file inventory | PASS |
| Targeted source trace for model, assignment, recovery, picker, API, and mapped scan boundary | PASS |
| `git diff --check` | PASS |
| `bash -n docker/init_scripts/init` | PASS |
| Debt-marker scan of modified production files | PASS, no untracked `TBD`, `FIXME`, or `XXX` marker found |

The earlier phase summary records that typecheck, locale parity/sorting, and a temporary-output build passed. This verifier did not rerun those commands because the job explicitly prohibits starting tests before live UAT, and it makes no new build or runtime claim.

## Requirements Coverage

The roadmap lists `ZA-SETUP-44-01` through `ZA-SETUP-44-04` and `ZA-INIT-44-01`; no matching Phase 44 rows are present in the current `.planning/REQUIREMENTS.md` ledger. Coverage is therefore assessed against the roadmap contract and plan must-haves.

| Requirement | Status | Evidence |
| --- | --- | --- |
| ZA-SETUP-44-01 | SATISFIED | Durable exclusion model, UI state, and recovery serialization. |
| ZA-SETUP-44-02 | SATISFIED | Exact-discovered-folder validation and excluded-completeness behavior. |
| ZA-SETUP-44-03 | SATISFIED | Mapping-only scan command data flow. |
| ZA-SETUP-44-04 | SATISFIED | Search, pinned action, translated label, and keyboard routes. |
| ZA-INIT-44-01 | SATISFIED | Init presentation trace and shell syntax evidence. |

## Human Verification Required

### 1. Setup row disposition and input modes

**Test:** In step 1, mark `Gamevault` and `Gametools` as `Nicht scannen`; type `win` for another folder and choose Windows once with the pointer and once through keyboard navigation/activation.

**Expected:** The exclusions are visibly selected, `Nicht scannen` remains above filtered and empty results, Windows is found by `win`, and a genuinely unresolved row still blocks `Weiter`.

**Why human:** The source establishes the interaction paths, but accessibility focus, rendered layout, and real discovered data need a browser.

### 2. Recovery, reversal, and first/later scan boundary

**Test:** Reload or revisit setup, replace one excluded row by selecting a platform, restore the exclusion if desired, complete setup, then run an initial and a later scan.

**Expected:** Saved exclusions survive recovery; platform selection clears the matching exclusion; `Gamevault` and `Gametools` are not scan inputs in either scan, while the Windows folder is scanned through its active mapping.

**Why human:** This needs a disposable authentic database and library, which this verification did not start or modify.

### 3. Docker runtime presentation

**Test:** Inspect startup output from the approved UAT environment.

**Expected:** The banner and `[ZockArchive][init]` prefix show ZockArchive, and the version line remains present.

**Why human:** Static script evidence and shell syntax cannot demonstrate container runtime output.

## Gaps Summary

No code gap was found. The only outstanding work is the deliberately deferred human UAT above. Merge, push, prerelease creation, GitHub Actions/GHCR verification, deployment, and persistent Docker operations remain outside the phase until explicit approval.

_Verified: 2026-11-11T15:39:17Z_
_Verifier: the agent (gsd-verifier)_
