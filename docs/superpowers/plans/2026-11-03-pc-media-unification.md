# PC Media Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give PC games and DLCs the same safe media navigation and reusable media UI while keeping every resource scoped to its owner.

**Architecture:** Keep media resources separate by owner. Main-ROM media continues through the existing owned-media contract. DLCs gain only component-owned manual, audio, and typed placement contracts, always addressed by the parent ROM plus component ID. Feature composites share the existing ZA primitives and are documented as composites in Storybook.

**Tech Stack:** FastAPI, SQLAlchemy/Alembic, Vue 3, TypeScript, Vitest, Storybook.

**Spec:** User job 261103-4b37.

## Global Constraints

- Preserve source-library immutability, provider tombstones, ownership and server-side authorization.
- Do not reuse parent media IDs or parent manual paths for DLC resources.
- Do not change the ZA glass fallback, login/pairing backgrounds, light theme, or reduced-motion behavior.
- Use generated OpenAPI contracts and all locale parity requirements.
- Run targeted checks only before live UAT, plus Storybook catalog/build.

## Review Focus

- A component media ID from a sibling DLC must remain unreadable and undeletable.
- Audio cannot enter image roles and a non-audio local soundtrack file cannot be selected as background music.
- Crossfading between art and fallback must not apply the art treatment to ZA glass.
- All icon-only and stateful actions retain labels, tooltips, disabled semantics and `aria-pressed`.
- Synthetic stories must never invoke live upload or deletion APIs.

### Task 1: Owner-scoped DLC media contracts

**Files:** backend component media model, responses, endpoint, handler, migration and endpoint/handler tests.

- [ ] Add typed component surfaces (`overview`, `background`, `soundtrack`) with surface-local order, role compatibility and ownership constraints.
- [ ] Add DLC-owned manual storage and endpoints, distinct from `Rom.path_manual`.
- [ ] Split image/audio/document validation by media role, retaining limits and owned-storage policy.
- [ ] Regenerate frontend OpenAPI types and run component media ownership, stale-version and MIME tests.

### Task 2: Shared media composites and uniform navigation

**Files:** GameDetails media composites, tests and locale entries.

- [ ] Build cards/actions/upload controls from `ZACard`, `ZABtn`, `ZAIcon`, `ZADropzone` and shared progress states.
- [ ] Replace crown with a layout icon and use it for both parent and DLC overview actions.
- [ ] Refactor DLC media into the four shared navigation sections while keeping its data and mutation endpoints component-scoped.
- [ ] Reuse upload validation/presentation while preserving media-type-specific endpoint validation.

### Task 3: Stories, documentation and dark artwork

**Files:** feature stories, inventory, ledger, architecture documentation, BackgroundArt and tests.

- [ ] Add synthetic composite and full-page stories for upload/cards/actions, main media and DLC media, with all requested states.
- [ ] Update component and architecture documentation to describe ownership and reusable composite boundaries.
- [x] Mark active image layers semantically and lighten only dark-theme game art, preserving glass and fallback treatment during crossfade.
- [ ] Run catalog/build, focused UI tests, target frontend checks and visual browser sweep.
