---
id: 261126-pnn
title: Repair the three new Gate05 mypy findings in targeted media tests
status: planned
scope: test-and-planning-only
product_head: 77f7192bc
---

# Quick Plan

## Finding and cause

The Gate05 Trunk comparison reports exactly three new test-only mypy findings.
`AsyncMock.await_args` is correctly typed as an optional call record, but the
endpoint test accesses `.args` without first proving that a call record exists.
The metadata test's nested media fixture is inferred as
`dict[str, list[dict[str, str]]]`, which cannot be passed as
`dict[str, object]` because mutable `dict` values are invariant. Neither
finding indicates a product behavior defect.

## Implementation

1. In `backend/tests/endpoints/roms/test_media.py`, preserve the existing
   refresh call-count assertion and make the optional mock call contract
   explicit before unpacking it: bind `prepare.await_args`, assert that it is
   not `None`, then read its two positional arguments. Keep the existing ROM
   identity and expected-version assertions unchanged. Do not add a fallback,
   skip, relaxed assertion, or production-code change.

2. In `backend/tests/handler/metadata/test_rom_media.py`, type the existing
   `source` fixture at its intended boundary as `dict[str, object]`, while
   retaining its exact nested `url_screenshots` data and both calls to
   `refresh_provider_owned_media`. This records the production function's
   accepted media-source contract and fixes both invariant-dict errors at
   lines 193 and 196 without casting away assertions or changing runtime
   behavior. Do not modify `backend/handler/metadata/rom_media.py`, test
   coverage, skips, or fixtures outside these two targeted tests.

3. Run no test suite. Run only the focused static check:
   `trunk check backend/tests/endpoints/roms/test_media.py backend/tests/handler/metadata/test_rom_media.py`.
   Create `SUMMARY.md` documenting the two typing causes, the exact minimal
   corrections, and that no test suite was started. Add a factual completed
   row to `.planning/STATE.md`. Before committing, inspect `git status` and
   the intended diff; commit only the two test files and this quick task's
   `PLAN.md`, `SUMMARY.md`, and STATE entry with a concise German message.

## Directly affected files

- `backend/tests/endpoints/roms/test_media.py`
- `backend/tests/handler/metadata/test_rom_media.py`
- `.planning/quick/261126-pnn-gate05-drei-neue-mypy-fehler-in-den-gezi/261126-pnn-PLAN.md`
- `.planning/quick/261126-pnn-gate05-drei-neue-mypy-fehler-in-den-gezi/SUMMARY.md`
- `.planning/STATE.md`

## Acceptance criteria

- Trunk no longer reports `mypy/union-attr` at `test_media.py:196`.
- Trunk no longer reports `mypy/arg-type` at `test_rom_media.py:193` or `:196`.
- The existing mock call, ROM identity, expected-version, media-failure, and
  retry assertions remain present and semantically unchanged.
- No product code, test skip, assertion removal, or full test suite is used.
- The quick-task summary and STATE row accurately record the scoped check and
  the absence of suite execution.
