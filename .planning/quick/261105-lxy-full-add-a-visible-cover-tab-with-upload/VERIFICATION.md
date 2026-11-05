---
quick_id: 261105-lxy
verified: 2026-11-05T16:18:00Z
status: human_needed
score: 4/4 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 3/5
  gaps_closed:
    - "The frontend API contract represents the new cover role and active candidate fields."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Deploy this exact branch, then at 1440px and 390px open main-game, DLC, and expansion Media pages, upload a harmless cover candidate, select it, revisit, and verify the exact owner poster changed."
    expected: "Each page exposes Cover, selection persists only for that owner, and no console/network failures occur."
    why_human: "The running service inspected during execution did not contain this commit; no authenticated browser mutation/revisit evidence exists."
---

# Quick 261105-lxy Verification Report

**Objective:** Add a visible owner-scoped PC Cover Media tab for main games,
DLCs, and expansions, with upload and explicit poster selection.

**Status:** `human_needed`

## Goal-backward findings

| # | Observable truth | Status | Code evidence |
|---|---|---|---|
| 1 | Main-game Media exposes a separately named Cover tab and panel. | VERIFIED | `MediaTab.vue` includes `cover` in `validSubtabs`, a visible `ZATabNav` item, and wires `PcCoverMediaTab` to `/roms/{id}/media`. `GameDetails.vue` supplies its authoritative refresh callback. |
| 2 | DLC and expansion Media expose the same productive Cover composite. | VERIFIED | `PcDlcMediaTab.vue` wires the same composite to the component endpoint. `get_managed_component` and the locked database lookup admit only `DLC` and `EXTRA`, excluding unrelated component kinds. |
| 3 | Server selection is scoped to the exact owner and durable in the model. | VERIFIED | Migration `0144_active_cover_candidates.py` adds nullable owner foreign keys. `select_owned_cover_media` checks the selected parent-owned active Cover row under the ROM lock; `select_pc_component_owned_cover_media` resolves the component by parent ID, allowed kind, version, and candidate membership. |
| 4 | The frontend contract represents the new persisted API fields and Cover role. | VERIFIED | Reverification of `6d41247b4` finds generated `RomOwnedMediaRole` includes `cover`, generated `DetailedRomSchema` and `PcComponentSchema` expose `active_owned_cover_media_id`, and the generated `OwnedCoverSelectionRequest` is exported. Hosts now use those typed fields directly rather than `Reflect.get`. |

## Artifact and wiring checks

| Artifact | Exists and substantive | Wiring/data flow | Result |
|---|---|---|---|
| `PcCoverMediaTab.vue` | Yes, it renders an image-only `ZADropzone`, upload control, candidate cards, explicit select action, selected state, and disables deletion of the active candidate. It does not render a background action. | Main and component targets pass owner-specific upload, content, selection, version, candidates, and refresh callbacks. | VERIFIED |
| `pcCoverMediaTarget.ts` | Yes, it defines the typed target boundary. | It is consumed by both Media hosts with the regenerated role and active-ID fields. | VERIFIED |
| `0144_active_cover_candidates.py` | Yes, non-destructively adds the two active-candidate foreign keys and expands the parent role constraint. | Model columns and selection handlers use the fields. | VERIFIED |
| `media.py` / `pc_component_resources.py` | Yes, protected upload and selection routes exist. | Parent selection returns a hydrated detailed ROM after deriving cover paths. Component selection resolves only the selected member of the exact component catalog. | VERIFIED |
| `MediaManagement.stories.ts` / `FRONTEND_ARCHITECTURE.md` | Yes, both reference the real Media components and describe the shared Cover composite and locked component scope. | Story data is synthetic and deliberately does not mutate. | VERIFIED |

## Key-link trace

1. `MediaTab` and `PcDlcMediaTab` render the same `PcCoverMediaTab` only when the visible Cover subtab is selected.
2. The composite posts multipart data to each target's owner-specific upload URL, posts a candidate ID plus expected version to its owner-specific selection URL, then awaits the supplied authoritative refresh.
3. Parent selection creates cover derivatives, atomically stores the selected candidate ID and resulting paths through the ROM handler, then returns `DetailedRomSchema`.
4. Component selection updates only `RomComponent.active_owned_cover_media_id` after the exact parent/component/kind/version lookup and returns the selected component-owned media row.

## Scope regression check

The inspected component presentation contains Cover, Screenshots, and Artwork only. It exposes no component Manual or Soundtrack tab and no component background placement action. The Cover composite itself offers select and delete only, never background placement. The existing DLC primary-tab synchronization code remains outside the new Cover tab wiring.

## Browser and deployment evidence boundary

This is not a successful live-UAT verification. The implementation is present in
the checked-out source, but the execution summary reports that the currently
served instance predates this implementation. Accordingly, no claim is made
that a real upload, selection, owner isolation, revisit, desktop rendering, or
mobile rendering succeeded. Those checks remain required after deployment.

## Required human closure

The code-level generated-contract gap is closed by `6d41247b4` and the
generator's additional manual upload artifact is retained by `3c19874c3`.
No application-code modification was made by this re-verification.

Deploy the resulting branch and perform the requested authenticated browser
   flow for main game, DLC, and every available expansion at 1440px and 390px.
   Record only sanitized screenshots and outcomes.
