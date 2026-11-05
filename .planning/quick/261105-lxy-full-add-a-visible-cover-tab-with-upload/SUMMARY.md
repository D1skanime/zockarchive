---
status: incomplete
quick_id: 261105-lxy
completed: 2026-11-05
commits:
  - f7de60588
---

# Visible PC Cover media management summary

The shared Media Cover surface now has retained owner-scoped candidates and an
explicit active candidate for a main PC game, DLC, or expansion.

## Delivered

- Added nullable active owned-cover references, non-destructive Cover candidate
  storage, exact-owner selection handlers, and migration `0144`.
- Added the shared `PcCoverMediaTab` to the visible main-game and managed
  component Media navigation. It uses the existing upload/card/action
  composites and deliberately has no background action.
- Limited component resource resolution to DLC and EXTRA, preserving the
  locked component scope for soundtrack, background placement, and manuals.
- Updated the productive media Storybook contexts and frontend architecture
  description.

## Verification and evidence gaps

- `git diff --check` passed before the implementation commit.
- The commit hook formatted the changed files and reported no new lint issues.
- The isolated schema client generation was attempted but the configured local
  schema owner at `127.0.0.1:3344` was unavailable. Generated OpenAPI files
  were therefore intentionally not hand edited.
- Authenticated browser evidence for the newly built source is unavailable:
  the deployed service does not include this commit. Its main-game Media page
  showed zero Cover tabs, and the direct DLC route returned to Login. No
  credentials, URLs, tokens, or media data were recorded. A deployment of this
  commit and rerun of the required desktop/mobile mutation flow remain needed.
- Per the UAT instruction, no test file or test suite was added or run.

## Follow-up

After the authorized branch deployment, regenerate the OpenAPI client through
the isolated schema-owner workflow and perform the specified browser-only main,
DLC, and expansion Cover upload/select/revisit evidence at 1440px and 390px.
