# Phase 43 Pre-UAT Validation Contract

## Scope and prohibition

This is the complete pre-UAT evidence contract for Phase 43. It deliberately
uses static inspection, typecheck/build, Compose rendering, Docker state, and
direct browser observation. Creating tests or executing any test suite is
prohibited before human UAT. In particular, do not run or add pytest, Vitest,
Playwright, CI workflow tests, automated Compose/stack tests, registry login,
publication, tag creation, release creation, manual SQL, or any command that
selects `pgdp-*` resources.

All receipts are secret-free. They may name an image tag, project identifier,
variable name, opaque persistence identifier, digest, status, browser route,
and exact immutable Portainer reference. They must not contain secret values,
rendered Compose output, environment-file paths or contents, authentication
tokens, or copied registry/manifests.

## Allowed evidence matrix

| Plan / task | Required non-test evidence | Acceptance record |
| --- | --- | --- |
| 43-01 / Task 1 | Static workflow inspection: exact optional-`v` normalization, raw `0.1.0-beta.1` and `beta` metadata, `latest=false`, linux/amd64 plus linux/arm64, `full-image`, and ScreenScraper secret references. Negative static assertions reject `latest`, major, minor, slim, and implicit aliases. | Diff/check output names only, no release execution. |
| 43-01 / Task 2 | Static workflow inspection: one two-secret `USE_DOCKERHUB` guard gates both Docker Hub login and its sole existing repository line; GHCR remains unconditional and `build-push-action` consumes normalized metadata output. Negative assertions reject fallback namespace, Docker Hub host aliases, and extra destinations. | Diff/check output names only, no login or push. |
| 43-02 / Task 1 | Compose static render with one untracked temporary env file and `docker compose config --quiet`; inspect image-only services, required interpolation, health gates, named volumes, read-only library, and external Valkey wiring. | Command success and topology facts only, never rendered values. |
| 43-02 / Task 2 | Static template inspection plus negative value scan confirms every required/optional `ZA_` variable is named while password/auth-secret assignments are blank. | File/diff evidence only. |
| 43-03 / Task 1 | Static Markdown/link inspection confirms both Portainer contracts, exact GHCR beta contract, entrypoint-first-start/persistence guidance, and no publication claim. | File/diff evidence only. |
| 43-03 / Task 2 | Static Markdown/architecture inspection confirms future human-gated release sequence, optional Docker Hub behavior, ScreenScraper limitation, and responsibility boundaries. | File/diff evidence only. |
| 43-04 / Task 1 | `npm run typecheck`, `npm run build`, local `docker build --platform linux/amd64 --target full-image` under one unique `za-phase43-uat:<token>` tag, then Compose static render using the same untracked env file. Optional arm64 Buildx attempt is recorded only when capability and capacity exist. | Image architecture/tag and command-class result, never env values/path or rendered config. |
| 43-04 / Task 2 | Docker/Compose inspection using the same `--env-file` for every Compose command, health/readiness evidence, bounded ZA logs, and direct browser setup/sample-library observation. Record all four persistence boundaries before and after ZA-only recreation: browser-visible DB/setup identifier, configuration marker basename plus digest, browser-created managed-resource identifier, and external-Valkey key plus value digest. | `43-UAT.md` records before/after identifiers, health/readiness, entrypoint/migration and no-internal-Valkey evidence, browser setup and sample-library result, with no secrets or env-file data. |
| 43-04 / Task 3 | Docker state plus bounded Portainer browser readiness for `portainer/portainer-ce@sha256:1c9fd7e7a19941c15bec2c915298a5c95c7d2fab9882772bdb4dbe57a4d019f1` under a distinct `za-phase43-portainer-<token>` identity and loopback port. | Secret-free handoff records the exact immutable reference, local image tag, stack file, variable names, sample-library handoff location, access route, and bounded teardown authority. |

## Receipt and readiness revision

- 43-UAT.md uses fixed za-phase43-receipt-v1 key=value fields. Required
  non-secret before/after pairs are database/setup ID and state, config-marker
  name and SHA, managed-resource ID and URL, and Valkey key and value SHA.
  Each after value is read directly after the exact ZA-only recreate and must
  equal its before value.
- The protected handoff is only ${TMPDIR:-/tmp}/za-phase43-261110-0413/stack.env.
  The directory is mode 700, the file mode 600. Each task rederives this
  locator, rejects symlinks, verifies ownership/mode, and verifies exact
  project/repository/tag binding before Docker use. The receipt has neither
  this locator nor environment values.
- ZA readiness is GET /api/heartbeat, HTTP 200 JSON with
  SYSTEM.SHOW_SETUP_WIZARD true before setup and false after recreate.
  Portainer readiness is GET /api/status, HTTP 200 JSON with Version, followed
  by browser inspection of /#!/init/admin initial-administrator form. Use the
  plan's 90-second ZA and 60-second Portainer deadlines and scoped failure logs.

## Cross-task invariants

- One mode-600 untracked environment file created in 43-04 Task 1 remains live
  through Tasks 2 and 3. It holds the local image repository/tag handoff and
  the non-secret `ZA_UAT_PROJECT` identity, so later tasks recover the same
  isolated project without reconstructing values. Every Compose invocation
  receives its exact `--env-file` and the same isolated `-p "$uat_project"`;
  it is removed only during authorized bounded cleanup after handoff.
- Persistence is complete only if every listed database, configuration,
  managed-resource, and external-Valkey identifier is observed both before and
  after `up -d --force-recreate --no-deps za`. MariaDB and Valkey are not
  recreated for this proof.
- Browser evidence must show a bounded readiness route before setup, then the
  completed first-user setup and readable sample library both before and after
  ZA recreation. Container-running status alone is insufficient.
- The static workflow gate rejects forbidden release aliases and any optional
  registry path that is not protected by the same all-or-nothing two-secret
  guard.
