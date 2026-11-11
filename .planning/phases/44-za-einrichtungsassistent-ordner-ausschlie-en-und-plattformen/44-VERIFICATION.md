# Phase 44 Technical Verification

**Status:** Pre-UAT technical verification complete. Human UAT remains required.

## Scope and Truthfulness

The product implementation was already present before Phase 44 execution in `1293dd139`, `9a398b364`, `647f17e37`, and `fb4f1afa8`. This verification records current-source evidence only. It does not claim that those commits were implemented during this phase, and it does not claim browser, first-scan, or later-scan execution.

## Static Contract Evidence

| Requirement | Evidence |
| --- | --- |
| Durable exclusion and mutual disposition | `SetupFolderExclusion` has a root/path uniqueness constraint. `SetupFolderHandler.assign` accepts a platform or `excluded`, persists exclusions transactionally, and removes an exclusion when a platform is chosen. `SetupRecoveryHandler` includes exclusions in saved state and does not resolve them as mappings. |
| Completion and scan boundary | The client accepts an excluded item as a complete disposition, while unresolved platform rows remain omitted and block progress. Exclusions have no `PlatformStorageMapping`; scan selection remains mapping-backed. |
| Search and input | `SetupStepPlatforms` passes `searchable`, translated pinned action text, and a `pinned-action` handler to the existing `ZASelect`. `ZASelect` filters normalized labels case-insensitively and retains the pinned action when results are filtered. |
| Docker presentation | `print_banner` uses ZockArchive text, all init logging functions use `[ZockArchive][init]`, and the existing Python version command and startup functions remain present. |

## Commands and Outcomes

| Command | Outcome |
| --- | --- |
| `git diff --check` | Passed. |
| `git show --stat --oneline 1293dd139 9a398b364 647f17e37 fb4f1afa8` | Passed, original scopes inventoried. |
| Targeted `rg` inspection of model, handler, recovery, setup UI/API, and picker symbols | Passed, all planned contract links found. |
| `bash -n docker/init_scripts/init` | Passed. |
| `npm run typecheck` | Passed. |
| `python3 src/locales/check_i18n_locales.py` | Passed, all translations complete. |
| `python3 src/locales/check_i18n_sorted.py` | Passed, all locale files sorted. |
| `npm run build -- --outDir /tmp/za-261111-98c5-phase44-vite-build` | Passed. Non-fatal pre-existing `:deep`, dependency `eval`, and chunk-size warnings were emitted. |

## Test Policy

No new tests were written. No test suite was run. This follows the pre-live-UAT instruction.

## Browser and Runtime Limitation

No safe isolated authentic setup environment was already available for this task. The agent did not start a service, access a permanent Docker stack, create a database, mutate source folders, or initiate scans. Browser and scan runtime verification therefore remain human UAT rather than inferred success.

## Human UAT Procedure

1. Exclude `Gamevault` and `Gametools` using the pinned `Nicht scannen` action.
2. Type `win`, find Windows, and choose it using pointer input and keyboard input.
3. Verify selected exclusion text, empty-filter visibility of the pinned action, incomplete-row blocking, and setup completion after all rows are mapped or excluded.
4. Reload setup, confirm saved exclusions, replace one exclusion with a platform, then restore the exclusion if desired.
5. Complete setup. Verify the first and later scan do not inspect the excluded folders, while the Windows mapping remains a scan input.
6. Inspect the container startup log for ZockArchive banner, `[ZockArchive][init]`, and preserved version output.

## Explicitly Deferred

Human UAT approval, ki-run merge/push, prerelease tag and notes, GitHub Actions, GHCR image confirmation, deployment, and all persistent Docker resources remain outside this phase until explicit approval.
