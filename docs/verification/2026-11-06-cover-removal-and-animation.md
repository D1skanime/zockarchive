# Original cover removal and animated upload verification

The coordinator took over job `261103-4b37` after the job agent repeatedly
returned without implementation. The job was stopped before edits. All source
changes and commands ran in the canonical Linux checkout on the existing job
branch. No main merge or push was performed.

## Behavior

Retained original/crawler covers now have an explicit, confirmed delete action.
The versioned owner endpoint clears only that original source and records durable
provider URL suppression. A separate selected upload stays selected. Resource
files are retained because independent candidates or surfaces can share them;
legacy directory discovery cannot revive the removed source. Tombstone-only
records are excluded from the selectable cover list. No migration is needed.

## Actual user files and browser evidence

A disposable owner `codex-cover-verification-3a969d8d85` (ROM 42, component 29)
was created specifically for this test. User-owned ROM 29 and its files were not
changed. The normal browser flow was Media > Cover > Upload > Select cover >
Reload, using the exact user-provided files, not prebuilt API response mocks.

| File                          | SHA-256 of input and persisted output                            | Frames | Main hero                                                  | DLC hero                                                   |
| ----------------------------- | ---------------------------------------------------------------- | ------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
| Witcher_3_Animated_Cover.apng | ca8fc4777adc1bd61321b6df1097b15940462f0b5ad1ab7a0bb3f20fa5612d89 | 9      | candidate 667, selected after reload, changing hero paints | candidate 277, selected after reload, changing hero paints |
| Witcher_3_Animated_Cover.webp | 70518bdae746b04613100be31b00f9beb0ec555a56e6fda948db5141fe6cac89 | 9      | candidate 668, selected after reload, changing hero paints | candidate 278, selected after reload, changing hero paints |

Hero sources were the corresponding owner-scoped `/media/{id}/content` routes.
Time-separated screenshots cropped exclusively to the rendered hero had
changing image bytes for all four cases. File inspection independently confirmed
9-frame PNG/WebP originals and exact input/output hashes. This verifies the
manual upload route; it is not a new claim that ROM 29's old static derivative
has been recovered or that the crawler dialog was exercised in this pass.

A synthetic retained original pointed at the APNG resource shared with candidate 667. Its delete button opened the confirmation dialog. Confirming retired the
original source. After reload, only candidates 667/668 remained, candidate 668
stayed selected, and its hero URL remained unchanged. Shared candidate bytes and
the DLC candidates remained intact. Test-only rows/files were cleaned afterwards.

## Automated verification

New tests first failed because the original-delete method/button were absent.
Further failing regressions exposed legacy re-download, directory rediscovery,
and tombstone records being offered as selectable covers; each was fixed and
re-run. Existing navigation test expectations were aligned with the already
shipped Cover and active-placement tabs without removing behavioral checks.

- Isolated MariaDB: 116 targeted handler, resource and endpoint tests passed.
- Follow-up isolated endpoint run: 10 passed, including authentication and
  viewer denial. Two existing warnings concern Alembic path configuration and
  an unrelated SQLAlchemy relationship.
- Frontend: 17 targeted Cover, MediaTab and DLC media behavior tests passed.
- OpenAPI models regenerated from the running backend; frontend typecheck passed.
- No full regression suite was run before human UAT.

- Production build passed with output `/tmp/za-cover-verification-build`,
  including PWA generation (609 precache entries). The default build directory
  was owned by the development container and the default build attempt failed
  during PWA output generation; no permissions were changed. The isolated-output
  build emitted existing CSS `:deep`, PDF dependency `eval`, and chunk-size
  warnings unrelated to the cover changes.
- Independent read-only review found no critical or important issues.
- Synthetic ROM 42/component 29 and their exact owned resource directory were
  removed after owner identity/path verification. User fixtures were retained.
- The stalled ki-run agent remains stopped. This document does not grant human
  UAT acceptance or authorize a main merge.
