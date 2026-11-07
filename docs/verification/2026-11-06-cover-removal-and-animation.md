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

## Follow-up: exact edit-dialog crawler reproduction

The user prepared a SteamGridDB cover in Edit > Search cover and explicitly
asked the coordinator to press Apply on ROM 29. That request was executed once
with the prepared form. The old standard PUT path downloaded the selected PNG
with 121 animation frames into legacy `cover/big.png`, but left active candidate
645 unchanged and added no owned-cover row. The API and browser therefore kept
showing the old candidate even though download/animation preservation succeeded.
This is distinct from manual Upload and the PC metadata review path.

The corrected standard PUT path stages a separate owned file, catalogs the
source and atomically selects it with the form update. New isolated tests cover
that exact API boundary, reload, repeated Apply, cover-card switch/reselection,
original-file preservation, existing-provider identity reuse, failed downloads,
and concurrent-edit cleanup. The source downloader and security rules are reused;
no size limit or source-library permission was relaxed. The reference-only card
selection also prevents APNG flattening during subsequent reselection.

### Follow-up verification result

- 107 targeted isolated MariaDB tests passed (standard edit route, media routes,
  cover mutation tests and the new searched-cover regressions). Two pre-existing
  Alembic/SQLAlchemy warnings remain. The older general form test now uses an
  in-memory JPEG transport instead of depending on public IGDB DNS.
- Source selection, form update and catalog publication were independently
  reviewed. Two findings were corrected and regression-tested: APNG card
  reselection must retain source bytes, and reusing a provider URL must retain
  its provider identity rather than alias one file under two candidate rows.
- The coordinator reapplied the exact source already selected by the user
  through the normal edit dialog. ROM 29 now has active provider candidate 671,
  alongside uploads 645 and 666. The large hero uses
  `/api/roms/29/media/671/content` before and after reload.
- Candidate 671 is a PNG/APNG with 121 frames. Its SHA-256 is
  `f4d15b2f67285e33611c517d6de9f93f336ccef8df34b3188fcac9d6076ad8a8`.
- The source is `126327057faf5853198cf5d3a78bb152.png` from the user's prepared
  SteamGridDB choice. No different cover was substituted. No media was deleted.

- Time-separated browser screenshots cropped to the actual large hero changed
  after reload (14865 versus 14739 encoded PNG bytes); its loaded DOM source
  remained candidate 671 and natural width 600. This confirms visible animation
  on the selected real cover, not only decodable animation at another endpoint.

## Post-acceptance regression test maintenance

The first full merge gate exposed 24 frontend failures across five test files.
No merge was performed. The obsolete source assertions now follow placement
management in its dedicated surface and soundtrack filtering in its composable.
The DLC cover fixture explicitly selects its candidate and asserts the protected
content endpoint instead of assuming the first candidate becomes the cover.

The mutation inventory now resolves computed owner endpoints and enumerates
conditional route arguments. The shared cover composite is inventoried for both
parent and DLC contracts, with a test pinning the production constructors and
complete caller set. Unknown routes remain errors. Reviewed media-label digests
are recorded in a test-only snapshot; the original branding snapshot is retained.
The previous main digests and exact changed translation keys were checked before
recording these snapshots.

Validation: all five affected files pass, 86 tests. The inventory includes two
additional contract tests. Scoped Trunk checks pass. Only tests, test fixtures and
this verification report changed after human acceptance. The full gate must
still pass before merge.

### Backend contract fixture maintenance

The full MariaDB run exposed older cover-as-artwork fixtures. Suppression cases
that source the cover field now seed COVER records; artwork identity-boundary
cases remain distinct. The invalid-role database test now uses a short invalid
value, so it exercises the role constraint rather than column length.
The ROM route policy fixture includes the current active-cover field. Failed
provider selection explicitly expects its existing ValueError and still checks
that all prior cover paths and resource bytes survive. The Steam reuse fixture
uses COVER and the corresponding canonical inventory order.

All 134 tests across the four affected database, suppression, replacement and
storage-policy files pass in a disposable MariaDB target. The six Steam media
tests also pass. Scoped Trunk checks pass. These are test-only changes; the full
merge gate remains pending.

The parent PC metadata selection endpoint test now mocks the current owned-cover
download boundary instead of the retired legacy cover downloader. It asserts
the exact provider URL, selected catalog record, cover role and content paths,
while retaining screenshot overwrite and selection assertions. This removes an
unintended dependency on public IGDB DNS. All 62 tests in test_pc_metadata.py
pass in disposable MariaDB; scoped Trunk passes.
