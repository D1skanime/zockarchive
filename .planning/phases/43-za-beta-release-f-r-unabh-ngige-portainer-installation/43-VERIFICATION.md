---
phase: 43-za-beta-release-f-r-unabh-ngige-portainer-installation
verified: 2026-11-10T19:26:48Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 6/7
  gaps_closed:
    - "Managed resource id=3 and its canonical content URL were equal before and after ZA-only recreation; authenticated post-recreate content was image/png."
    - "A production build with an isolated temporary outDir completed without changing the pre-existing non-writable frontend/dist."
  gaps_remaining: []
  regressions: []
final_hardening:
  commits:
    - d7b83f62a
    - b4cbfab91
  result: "VERIFIED: tag is passed through an environment variable, validation has read-only permissions, build retains package write only, and MariaDB/Valkey use digest-pinned image indexes."
human_verification:
  - test: "Initialize the temporary Portainer CE administrator and deploy the supplied release stack using only the recorded local image, variable names, and isolated sample-library path."
    expected: "Portainer shows the stack healthy; ZA reaches login after first-user setup; the sample library is readable; no permanent pgdp resources are selected."
    why_human: "Portainer form completion and browser workflow correctness cannot be established from static inspection or unauthenticated readiness endpoints."
---

# Phase 43: ZA Beta Release for Independent Portainer Installation Verification Report

**Phase Goal:** Operators can prepare and locally prove an independent, image-based ZockArchive beta installation in Portainer without publishing, tagging, pushing, or touching permanent development resources.
**Verified:** 2026-11-10T19:26:48Z
**Status:** human_needed
**Re-verification:** Yes, after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Published `v0.1.0-beta.1` would build amd64/arm64, publish only `0.1.0-beta.1` and `beta`, never `latest`, with Docker Hub guarded by both credentials. | VERIFIED | [build.yml](../../../.github/workflows/build.yml) passes the event tag via `RELEASE_TAG`, validates `^v?0.1.0-beta.1$`, uses raw normalized/beta tags, `latest=false`, dual platforms, and one `USE_DOCKERHUB` guard. Validation is read-only; only the publisher retains package-write permission. |
| 2 | GHCR contract and ScreenScraper-secret/embedded-image disclosure are correct and secret-free. | VERIFIED | Workflow targets `ghcr.io/d1skanime/pc-game-download-portal`, passes only GitHub secret expressions; [RELEASE.md](../../../docs/RELEASE.md) documents the limitation without values. |
| 3 | The image-only ZA/MariaDB/Valkey stack fails required input before startup and retains the established entrypoint path. | VERIFIED | [portainer-release.yml](../../../examples/portainer-release.yml) has no build context, uses required interpolation, health-gated dependencies, `REDIS_HOST=za-valkey`, no entrypoint replacement, and digest-pinned MariaDB/Valkey images. A dummy-value `docker compose config --quiet` render passed. |
| 4 | Catalog, resources, Valkey, configuration, assets, and library have correct declared persistence/ownership boundaries. | VERIFIED | Compose declares the three named volumes, writable config/assets binds, and [PORTAINER_INSTALL.md](../../../docs/PORTAINER_INSTALL.md) supplies the update-retention contract. |
| 5 | Documentation distinguishes source and release stacks, human-gated future release, and non-publication. | VERIFIED | [PORTAINER_INSTALL.md](../../../docs/PORTAINER_INSTALL.md), [RELEASE.md](../../../docs/RELEASE.md), [BACKEND_ARCHITECTURE.md](../../../docs/BACKEND_ARCHITECTURE.md), and [examples README](../../../examples/README.md) agree on the separation and never claim a published release. |
| 6 | Pre-UAT local-image, first-install, recreation, and persistence evidence is complete. | VERIFIED | [43-UAT.md](43-UAT.md) records equal database/config/resource/Valkey pairs. It records managed resource `id=3` and `/api/roms/1/media/3/content` before and after recreation, with authenticated post-recreate `image/png`; a temporary-outDir production build and the clean image build passed. |
| 7 | A separately ported temporary Portainer CE instance is ready with a secret-free handoff. | VERIFIED | Receipt records only permitted handoff facts. Read-only verification returned ZA heartbeat HTTP 200 with wizard false, Portainer `/api/status` HTTP 200 with Version, and the exact amd64 local image ID remains present. |

**Score:** 7/7 truths verified

## Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.github/workflows/build.yml` | Deterministic beta OCI workflow | VERIFIED | Substantive workflow with environment-safe tag validation, least-privilege permissions, metadata, and build-push wiring. |
| `examples/portainer-release.yml` | Image-only ZA/MariaDB/Valkey contract | VERIFIED | Substantive topology, with required interpolation, health gates, external Valkey, volumes, mount boundaries, and pinned database/cache image indexes. |
| `examples/portainer-release.env.example` | Value-free variable inventory | VERIFIED | All declared `ZA_` inputs are blank; no secret assignment was found. |
| `docs/PORTAINER_INSTALL.md`, `docs/RELEASE.md`, `docs/BACKEND_ARCHITECTURE.md`, `examples/README.md` | Operator and architecture contract | VERIFIED | Cross-linked and aligned with the compose and workflow contracts. |
| `43-UAT.md` | Parseable secret-free runtime receipt | VERIFIED | Exists, follows `za-phase43-receipt-v1`, and contains equal, non-empty before/after values for all four persistence boundaries. |

## Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `build.yml` | GitHub release tag | normalized tag output | WIRED | Validation output is consumed by metadata labels/tags and version replacement. |
| `build.yml` | GHCR and optional Docker Hub | metadata tags to `build-push-action` | WIRED | GHCR is unconditional; both Docker Hub paths use the same two-secret condition. |
| release Compose | image entrypoint | no entrypoint override | WIRED | Image uses its default `ENTRYPOINT`/`CMD`; `docker/init_scripts/init` owns migration and external-Valkey selection. |
| release Compose | Valkey | `REDIS_HOST`, `REDIS_PORT`, healthy dependency | WIRED | Static contract plus source entrypoint condition agree. |
| Portainer docs | release Compose | `portainer-release.yml` procedure | WIRED | Operator guide names the correct stack and variable template. |
| UAT receipt | ZA-only recreation evidence | before/after equality | WIRED | All eight required before/after field pairs agree, including managed-resource ID `3` and its canonical content route. |
| Release stack | resolved Compose model | static `config --quiet` render | WIRED | Current stack renders successfully with non-secret dummy required inputs after the image-pin hardening. |

## Data-Flow Trace (Level 4)

No dynamic UI artifact was introduced by this phase. The runtime boundary needing data-flow proof is the managed-resource browser action. The updated receipt traces a CSRF-authenticated PNG upload to resource `id=3`, then records the same canonical content route and `image/png` after recreating only ZA. A read-only unauthenticated request returned HTTP 401, which is consistent with the protected resource route and does not contradict the authenticated proof.

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Existing ZA remains ready after UAT recreation | `curl .../api/heartbeat` | HTTP 200, `SHOW_SETUP_WIZARD=false` | PASS |
| Temporary Portainer remains ready | `curl .../api/status` | HTTP 200, non-empty `Version` | PASS |
| Exact local candidate identity remains available | `docker image inspect <receipt tag>` | Receipt SHA-256 image ID, `amd64` | PASS |
| Isolated production build | Recorded in UAT receipt | `npm run build -- --outDir <temporary Phase 43 path>` passed and wrote production/PWA assets without touching `frontend/dist` | PASS |
| Managed-resource content endpoint without credentials | `curl .../api/roms/1/media/3/content` | HTTP 401 JSON | PASS, protected endpoint; authenticated browser receipt supplies the post-recreate `image/png` assertion |
| Hardened release stack syntax | `docker compose ... config --quiet` | Exit 0 with non-secret dummy inputs | PASS |

No test suite was run or added. This follows the Phase 43 pre-UAT validation contract. No container, volume, network, image, or Portainer state was changed during verification.

## Requirements Coverage

The eight `ZA-REL-43-*` identifiers are listed by the roadmap and claimed by the plans, but have no standalone definitions in `REQUIREMENTS.md`. Coverage below therefore uses their plan-to-roadmap mapping; the missing central descriptions are a traceability warning, not a substitute for implementation evidence.

| Requirement | Source Plan | Status | Evidence |
| --- | --- | --- | --- |
| ZA-REL-43-01 | 43-01 | SATISFIED | Exact prerelease validation and OCI metadata contract. |
| ZA-REL-43-02 | 43-01, 43-03 | SATISFIED | GHCR target, secret-only ScreenScraper args, limitation documentation. |
| ZA-REL-43-03 | 43-02, 43-03 | SATISFIED | Image-only compose, entrypoint and no-manual-SQL contract. |
| ZA-REL-43-04 | 43-02, 43-03 | SATISFIED | Volumes, read-only library, writable binds, update documentation. |
| ZA-REL-43-05 | 43-03 | SATISFIED | Separate deployment/release documentation and non-publication language. |
| ZA-REL-43-06 | 43-04 | SATISFIED | amd64 image, isolated production build, browser setup, and recreation evidence are recorded. |
| ZA-REL-43-07 | 43-04 | SATISFIED | Managed resource `id=3` and canonical URL persist across ZA-only recreation. |
| ZA-REL-43-08 | 43-04 | SATISFIED | Isolated Portainer API/browser-ready handoff is active and independently rechecked. |

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `examples/README.md` | 15 | `latest` reference for retained manual prebuilt example | INFO | It explicitly excludes that legacy example from the independent release contract; no release-stack `latest` path exists. |

## Human Verification Required

### 1. Temporary Portainer operator flow

**Test:** Complete the temporary Portainer initial-administrator form and deploy the image-only stack with the supplied handoff only.

**Expected:** The stack is healthy, ZA reaches its login after setup, the sample library is readable, and no permanent `pgdp-*` resource is selected.

**Why human:** This is a browser/Portainer workflow, not a static or readiness-endpoint property.

## Human UAT Boundary

All technical must-haves are now evidenced. The former managed-resource and production-build gaps are closed without modifying permanent resources. The phase remains `human_needed`, rather than passed, because Portainer administrator setup and the full operator-facing stack workflow require a human browser UAT. Do not publish or accept a release before that UAT.

_Verified: 2026-11-10T19:26:48Z_
_Verifier: the agent (gsd-verifier)_
