# Phase 43: ZA Beta Release for Independent Portainer Installation - Research

**Researched:** 2026-11-10
**Domain:** Release-triggered multi-architecture OCI image publication and image-only Docker Compose deployment for Portainer
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Release and Image Publication
- The intended first prerelease is `v0.1.0-beta.1`. Repository tag validation accepts the leading `v`; image metadata emits `0.1.0-beta.1` and `beta`, never `latest`.
- The authoritative release image is `ghcr.io/d1skanime/pc-game-download-portal`, because it is the existing package destination tied to the renamed ZockArchive repository. The workflow documents this retained package path.
- GitHub Actions builds and publishes linux/amd64 and linux/arm64 on a published release only. This phase performs no publication action.
- Docker Hub is optional. Its login and push run only when both Docker Hub credentials are configured as repository secrets. A missing Docker Hub configuration must not fail GHCR publication.
- The ScreenScraper developer build arguments are supplied from `SCREENSCRAPER_DEV_ID` and `SCREENSCRAPER_DEV_PASSWORD` GitHub secrets. They intentionally remain embedded in the published image and the resulting disclosure is documented as a known limitation.

#### Portainer Deployment Contract
- Add `examples/portainer-release.yml` that pulls an image rather than building source. It starts ZA, MariaDB and Valkey with health-gated dependencies and reuses the established application entrypoint for database migrations and first-start initialization.
- All operator secrets are Portainer stack variables. A value-free release environment example names every required and optional variable. Missing required variables fail clearly before a silent partial startup.
- Named volumes retain MariaDB, resources and Valkey state. Bind mounts retain the operator-selected configuration and a read-only game library. The stack and operator documentation make these update-persistence boundaries explicit.
- The empty-database case is a supported first deployment. No manual database command, Git checkout or source build is part of the operator path.

#### Validation and UAT
- Before human UAT, do not add or modify automated tests and do not start test suites. Typecheck/build, an isolated local installation test and direct browser inspection are the required pre-UAT evidence.
- The installation proof builds a local amd64 image from this branch, deploys it with temporary volumes and a separate Compose project using the release stack, exercises setup and a sample library, recreates the application container, and verifies durable database, configuration and media state. Arm64 buildx is attempted only when VM resources allow it.
- Provide a temporary, separately ported Portainer CE instance for human UAT. The handoff records the local image tag, stack file, variables by name, test-library host path and access route without recording any secret values.
- The release notes and installation documentation describe the later human release sequence, the no-Docker-Hub-credentials behavior, and known limitations. No release or image publication is executed in this phase.

### the agent's Discretion
Choose exact Compose variable names, entrypoint guards, build metadata implementation and temporary test resource names from established repository patterns, while keeping secrets out of tracked files, output and planning evidence.

### Deferred Ideas

- Creating the `v0.1.0-beta.1` tag, publishing the GitHub prerelease, and pushing any image happen only after human acceptance and merge.
- Automated workflow and stack tests are intentionally deferred until post-acceptance instruction.

## Project Constraints (from AGENTS.md)

- Work only in `/home/d1sk/pc-game-download-portal` on the Linux host. Preserve unrelated worktree changes and do not access Team4s or a real NAS mount.
- This ki-run checkout is occupied. Do not alter permanent `pgdp-*` stacks or resources. The phase's isolated validation uses separately named temporary resources only.
- Do not deploy, publish, push, tag, log in to a registry, or run an actual release in this phase.
- Never expose or commit credentials, filled environment files, images, databases, media, or local runtime state.
- Documentation must ship with the implementation. Production files must respect the 500 logical-line target and the 1,000-line prohibition.
- Repository prose and code comments are English first, concise, and contain no em dash.
- GSD coordination remains in chat. Do not ask the user to operate commands or watch logs.

## Summary

The repository already has the important primitives but they describe a Git-source Portainer deployment, not an independent release image. `examples/portainer-stack.yml` builds `docker/Dockerfile` with the `full-image` target. Its production image launches the existing `docker/init_scripts/init`, which starts an internal Valkey when `REDIS_HOST` is absent and applies Alembic migrations before serving the UI. [VERIFIED: codebase grep] Phase 43 should retain that entrypoint behavior while making the release contract explicit: the release stack must set `REDIS_HOST` to a separate Valkey service and not replace the application bootstrap with a custom migration or setup container. [VERIFIED: codebase grep]

The current release workflow has Buildx/QEMU, pinned action revisions, release-published triggering, and full-image multi-platform build inputs, but rejects a leading `v`, logs in to Docker Hub unconditionally, emits major/minor aliases, and includes Docker Hub as a mandatory image target. [VERIFIED: codebase grep] The recommended revision is a single release image path, `ghcr.io/d1skanime/pc-game-download-portal`, with metadata calculated from a normalized tag, explicit `0.1.0-beta.1` plus `beta` tags, and `latest=false`. A release `published` trigger includes prereleases, and Docker's documented Buildx flow supports `linux/amd64,linux/arm64` with QEMU. [CITED: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows] [CITED: https://docs.docker.com/build/ci/github-actions/multi-platform/]

**Primary recommendation:** Plan three ordered units: harden the release workflow and image metadata, add a separately named image-only Portainer stack plus value-free variable template and operator documentation, then perform only the explicitly approved local build/install/browser evidence and prepare a secret-free UAT handoff.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Tag validation and multi-arch image publication | CI/CD | OCI registries | GitHub Actions owns event filtering, metadata and Buildx publishing. |
| Image selection and release configuration | Portainer / deployment | Docker Compose | Portainer supplies stack variables; Compose interpolates them into images, paths and service environments. |
| Persistent catalog/cache/media | Database / storage | Docker Compose | MariaDB, Valkey and resource volumes own durable runtime state. |
| Schema migration and first-user initialization | Application container | Database | The established entrypoint and backend startup own migration/setup, not a new shell or init service. |
| Local proof and human UAT | Local Docker host | Browser / Portainer CE | Temporary project names, ports and volumes isolate evidence from permanent development state. |

## Standard Stack

### Core

| Library / tool | Version / source | Purpose | Why Standard |
|---|---|---|---|
| GitHub Actions release event | Existing `.github/workflows/build.yml` | Trigger production builds only after a release is published | GitHub documents `release: types: [published]` for published stable and prereleases. [CITED: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows] |
| `docker/setup-qemu-action` and `docker/setup-buildx-action` | Existing pinned revisions | Emulated amd64/arm64 Buildx builder | Docker's GitHub Actions guide uses QEMU plus Buildx and `platforms: linux/amd64,linux/arm64`. [CITED: https://docs.docker.com/build/ci/github-actions/multi-platform/] |
| `docker/build-push-action` | Existing pinned revision | Build and publish one multi-architecture OCI manifest | It accepts the documented platform list and registry push workflow. [CITED: https://docs.docker.com/build/ci/github-actions/multi-platform/] |
| `docker/metadata-action` | Existing pinned revision | OCI labels and explicit prerelease tags | Its SemVer `{{version}}` output removes a leading `v`, while prereleases deliberately do not expand to major/minor aliases. [CITED: https://github.com/docker/metadata-action] |
| Docker Compose v2 | Docker 29.6.2 installed, `docker compose` subcommand available | Render and run local isolated release stack | Compose supports required variable interpolation and health-gated dependencies. [CITED: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/] [CITED: https://docs.docker.com/compose/how-tos/startup-order/] |
| Portainer CE | `portainer/portainer-ce@sha256:1c9fd7e7a19941c15bec2c915298a5c95c7d2fab9882772bdb4dbe57a4d019f1` (`2.45.3-linux-amd64` selected 2026-11-10) | Temporary local UAT operator UI | Immutable official amd64 manifest selected by anonymous manifest inspection, with no registry login or publication. [CITED: https://hub.docker.com/r/portainer/portainer-ce/tags/] |

### Supporting

| Tool | Purpose | When to Use |
|---|---|---|
| MariaDB image | Release catalog storage | Keep a healthcheck and named database volume in the release Compose file. [VERIFIED: codebase grep] |
| Valkey image | External queue/cache service for the release stack | Set `REDIS_HOST` and `REDIS_PORT` so the app does not also launch its internal Valkey. [VERIFIED: codebase grep] |
| `docker compose config` | Safe static render check for variables and topology | Run against only a temporary, untracked env file. It prints resolved values, so never include secrets in captured evidence. [CITED: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Release image stack with a Valkey service | Keep internal Valkey in the application container | Rejected by locked deployment contract, which requires ZA, MariaDB and Valkey services with persistent Valkey state. |
| GHCR as required target and Docker Hub conditionally enabled | Publish Docker Hub unconditionally | Rejected because absent Docker Hub secrets must not block GHCR. |
| Existing production entrypoint | A bespoke migration/init service | Rejected because it duplicates migration and setup ownership and risks divergence. |

**Installation:** No external package installation is required. [VERIFIED: codebase grep]

## Architecture Patterns

### System Architecture Diagram

```text
Published GitHub prerelease v0.1.0-beta.1
  -> release workflow validates optional leading v
  -> QEMU + Buildx build linux/amd64 and linux/arm64
  -> metadata emits 0.1.0-beta.1 and beta, never latest
  -> GHCR push (required)
  -> Docker Hub login/push branch only when both credentials exist

Portainer stack variables + image tag
  -> image-only `portainer-release.yml`
  -> MariaDB healthy -----\
  -> Valkey healthy ------- > ZA application image
                                -> established entrypoint
                                -> Alembic migration
                                -> empty DB first-user setup in browser
                                -> read-only library + persistent state
```

### Recommended Project Structure

```text
.github/workflows/build.yml             # release trigger, conditional registry routes, metadata
examples/portainer-release.yml          # image-only independent Portainer stack
examples/portainer-release.env.example  # value-free variables and operator-facing names
docs/PORTAINER_INSTALL.md                # source stack versus release-image flow, storage and updates
docs/RELEASE.md                          # pre/post-acceptance release sequence and limitations
examples/README.md                      # concise pointers to the two deployment paths
```

### Pattern 1: Required Compose substitutions for operator-owned secrets and paths

**What:** Use `${VAR:?message}` for database passwords, authentication key, library path, config path and asset path. Use `${VAR:-default}` only for non-secret defaults such as port, timezone and tagged image reference.

**When to use:** Every value that would otherwise make a stack start partially, create an anonymous volume from an empty host path, or destabilize authentication.

**Example:**

```yaml
environment:
  DB_PASSWD: ${ZA_DB_PASSWORD:?Set ZA_DB_PASSWORD in Portainer}
  ROMM_AUTH_SECRET_KEY: ${ZA_AUTH_SECRET_KEY:?Set ZA_AUTH_SECRET_KEY in Portainer}
volumes:
  - ${ZA_LIBRARY_PATH:?Set ZA_LIBRARY_PATH in Portainer}:/romm/library:ro
```

Docker Compose documents `${VAR:?error}` as a required non-empty interpolation form. [CITED: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/]

### Pattern 2: Health-gated external service startup

**What:** Both MariaDB and Valkey get healthchecks. ZA depends on their `service_healthy` condition and receives `REDIS_HOST` as the Valkey service name.

**When to use:** The release Compose path only. The application currently launches internal Valkey only when `REDIS_HOST` is empty. [VERIFIED: codebase grep]

**Example:**

```yaml
depends_on:
  za-db:
    condition: service_healthy
    restart: true
  za-valkey:
    condition: service_healthy
    restart: true
```

Compose waits for a dependency healthcheck when `condition: service_healthy` is used. [CITED: https://docs.docker.com/compose/how-tos/startup-order/]

### Pattern 3: Two explicit deployment contracts

**What:** Keep `portainer-stack.yml` as the documented Git-source build path and add `portainer-release.yml` as the independent image pull path. Do not silently change the existing source stack into a release stack.

**When to use:** Documentation, examples and Portainer UAT. This preserves current users and makes image provenance/tag selection inspectable. [VERIFIED: codebase grep]

### Anti-Patterns to Avoid

- **Replacing `docker/init_scripts/init`:** It already starts the selected Valkey mode and runs `alembic upgrade head`; a replacement risks divergent initialization. [VERIFIED: codebase grep]
- **Using `latest`, major, or minor tags for beta:** The locked beta contract permits only exact beta and `beta` tags.
- **Placing secrets in `docker compose config` evidence, release notes, fixture env files, or screenshots:** rendered Compose output includes substituted values. [CITED: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/]
- **Using permanent `pgdp-*` project names, ports or volumes for UAT:** this violates the isolation boundary and can attach UAT containers to development data.
- **Adding CI/automated stack tests pre-UAT:** explicitly deferred by the phase constraints.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Multi-architecture manifest assembly | Shell loops over Docker builds and manifest commands | Existing QEMU, Buildx and `docker/build-push-action` pattern | Buildx handles the manifest/index publication path. [CITED: https://docs.docker.com/build/ci/github-actions/multi-platform/] |
| SemVer/pre-release normalization | Bash version parser | `docker/metadata-action` with an explicit normalized value/tag plan | Existing workflow already uses it and it understands leading `v` SemVer tags. [CITED: https://github.com/docker/metadata-action] |
| App migration and first-start process | New setup scripts or one-off database commands | Existing production entrypoint and browser setup API | The entrypoint runs migrations; the backend exposes the setup router. [VERIFIED: codebase grep] |
| Secret injection | Tracked `.env` files | Portainer stack variables and untracked temporary local env file | Portainer supports variables without modifying Compose source. [CITED: https://docs.portainer.io/user/docker/stacks/add] |

## Common Pitfalls

### Pitfall 1: Release workflow accepts only unprefixed tags
**What goes wrong:** `v0.1.0-beta.1` publishes a GitHub release but the build job skips because the current regex rejects `v`.
**Why it happens:** Existing validation accepts only a digit at the first position. [VERIFIED: codebase grep]
**How to avoid:** Normalize or validate `v?` before metadata, then assert exact output tags `0.1.0-beta.1` and `beta`.
**Warning signs:** Workflow conclusion is skipped and the validation output is `valid=false`.

### Pitfall 2: Optional Docker Hub makes GHCR unavailable
**What goes wrong:** A missing Docker Hub secret fails the login action before GHCR push.
**Why it happens:** Current release workflow logs into Docker Hub unconditionally. [VERIFIED: codebase grep]
**How to avoid:** Gate Docker Hub login and its image name using a boolean requiring both credential secrets; keep GHCR image metadata and build route unconditional.
**Warning signs:** Docker Hub login is scheduled when one or both secrets are empty.

### Pitfall 3: Release stack accidentally starts two Valkey instances
**What goes wrong:** The new Valkey service exists, but the app has no `REDIS_HOST` and starts an internal instance that writes to a different volume.
**Why it happens:** The established init script deliberately starts internal Valkey only when `REDIS_HOST` is unset. [VERIFIED: codebase grep]
**How to avoid:** Set `REDIS_HOST` and `REDIS_PORT` in ZA, mount only the dedicated Valkey service volume at its data directory, and health-gate ZA on it.
**Warning signs:** App logs say it is starting internal Valkey, or Valkey volume data remains empty after a workload.

### Pitfall 4: Persistence claim does not survive container recreation
**What goes wrong:** Browser setup, config or managed media disappears because state was written to container filesystem or a project name changed.
**Why it happens:** Named volume identity and host bind paths are runtime boundaries, not source-file settings.
**How to avoid:** Test a recreate of only the ZA service with temporary project-scoped volumes and a dedicated test library. Confirm database state, config bind content, resources and Valkey state after recreate.
**Warning signs:** Setup page reappears, a volume list changes, or a mount resolves to an anonymous volume.

### Pitfall 5: Local validation leaks secrets or damages development state
**What goes wrong:** Compose output, shell history or the permanent `pgdp` project gains UAT values/data.
**Why it happens:** Compose interpolation resolves values into displayed output, and default project names collide.
**How to avoid:** Create a temporary untracked env file with generated values, use an isolated project name/ports/volumes, report variable names only, and remove only the explicitly created temporary resources after UAT authorization.
**Warning signs:** `docker compose ls`, `docker volume ls`, or local browser route shows an existing development deployment.

## Code Examples

### Conditional registry routing

```yaml
env:
  USE_DOCKERHUB: ${{ secrets.DOCKER_USERNAME != '' && secrets.DOCKER_PASSWORD != '' }}

- name: Login to Docker Hub
  if: env.USE_DOCKERHUB == 'true'
  uses: docker/login-action@<existing-pinned-sha>
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

Use the repository's existing pinned action SHA rather than introducing an unpinned version. GitHub secrets are available through the `secrets` context, and an unset secret evaluates to an empty string. [CITED: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets]

### Beta metadata policy

```yaml
flavor: |
  latest=false
tags: |
  type=semver,pattern={{version}},value=${{ steps.version.outputs.normalized }}
  type=raw,value=beta,enable=${{ steps.version.outputs.is_beta == 'true' }}
```

`docker/metadata-action` documents `{{version}}` as the SemVer version without a leading `v`, and documents prereleases as version-only rather than broad major/minor aliases. [CITED: https://github.com/docker/metadata-action]

## State of the Art

| Old Approach | Current Approach | Impact |
|---|---|---|
| Git-source Portainer build | Immutable tagged image pulled by Portainer | Operators do not need a Git checkout or Docker build context. |
| Single app container's internal Valkey | Separate health-checked Valkey service | Valkey persistence and service ownership become visible and independently durable. |
| Mandatory dual-registry publish | GHCR required, Docker Hub conditionally enabled | Missing optional credentials cannot prevent authoritative publication. |

**Deprecated/outdated:** The Git-source stack is not deleted, because it remains an established deployment path. It must be documented as distinct from the release-image path. [VERIFIED: codebase grep]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | The temporary Portainer CE UAT image is the official immutable amd64 manifest `portainer/portainer-ce@sha256:1c9fd7e7a19941c15bec2c915298a5c95c7d2fab9882772bdb4dbe57a4d019f1`, selected from `2.45.3-linux-amd64` on 2026-11-10 by anonymous manifest inspection. | Standard Stack | The immutable reference avoids mutable-tag drift while requiring no registry login or publication. |
| A2 | The release-stack variable prefix will be `ZA_` rather than retaining `PGDP_`. | Architecture Patterns | Existing operator migrations could be harder if the choice conflicts with prior branded-variable compatibility. |

## Open Questions (RESOLVED)

1. **Docker Hub namespace:** Conditional Docker Hub metadata may name only the existing repository path `d1skanime/pc-game-download-portal`. It is present only when both `DOCKER_USERNAME` and `DOCKER_PASSWORD` are non-empty. No fallback, derived namespace, extra destination, documentation promise, or Docker Hub login is permitted when either secret is absent. GHCR remains the single unconditional authoritative route.

2. **Temporary Portainer CE UAT image:** Use the current official Linux amd64 reference selected on 2026-11-10: `portainer/portainer-ce@sha256:1c9fd7e7a19941c15bec2c915298a5c95c7d2fab9882772bdb4dbe57a4d019f1`, whose source tag is `2.45.3-linux-amd64`. The immutable digest was obtained with anonymous manifest inspection, not registry login, pull authorization, publication, or image push. Record this exact reference in the secret-free UAT handoff.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---:|---|---|
| Docker Engine | Local image build and isolated stack UAT | Yes | 29.6.2 | None |
| Docker Compose v2 plugin | Render/deploy isolated release stack | Yes | bundled with Docker CLI | None |
| Docker Buildx CLI subcommand | Optional local arm64 attempt | No direct CLI alias reported | unavailable | Use normal local amd64 build; attempt only if Buildx becomes available and VM capacity permits |
| Node/npm | Frontend typecheck/build | Yes | Node 24.19.0, npm 11.17.0 | None |
| uv | Backend typecheck/build | Yes | uv 0.12.3 | None |
| Portainer CE | Temporary browser UAT | Not currently running | not applicable | Start a separately ported temporary CE container during approved UAT |

**Missing dependencies with no fallback:** None for the approved amd64 proof.

**Missing dependencies with fallback:** Local Buildx CLI availability only affects the optional arm64 attempt.

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Existing pytest/Vitest infrastructure, intentionally not run or modified before UAT |
| Config file | Existing repository configuration, no Phase 43 test additions |
| Quick run command | Not authorized pre-UAT |
| Full suite command | Not authorized pre-UAT |

### Phase Requirements -> Test Map

No requirement IDs are assigned in `ROADMAP.md`. The locked phase decision explicitly defers automated workflow and stack tests until post-acceptance. Use the following non-test evidence instead:

| Behavior | Evidence type | Command / action | Pre-UAT status |
|---|---|---|---|
| Production image builds for local architecture | Build evidence | Local amd64 image build from current branch | Required |
| Release Compose topology and required inputs | Static config evidence | `docker compose --env-file <temporary> -f examples/portainer-release.yml config` without retaining secret values | Required |
| Empty DB first start, migration and setup | Isolated installation proof | Deploy separate Compose project, then direct browser setup | Required |
| Durable DB/config/resources/Valkey state | Recreate evidence | Recreate ZA service only and inspect browser/runtime state | Required |
| Portainer operator path | Human UAT | Temporary separately ported Portainer CE handoff | Required |

### Sampling Rate

- **Per implementation task:** targeted syntax/config render or typecheck/build only, never an automated test suite before UAT.
- **Per wave merge:** inspect the intended diff and record non-secret evidence.
- **Phase gate:** human UAT accepts local Portainer CE deployment and persistence proof before any tag, push or publication.

### Wave 0 Gaps

- [ ] No automated tests before UAT by locked decision.
- [ ] Prepare a secret-free UAT record template that names local tag, stack file, variable names, library path and browser route only.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | Yes | Require persistent non-empty `ROMM_AUTH_SECRET_KEY`; complete first-user setup only via the application. |
| V3 Session Management | Yes | Preserve the authentication secret across redeploys through Portainer variables. |
| V4 Access Control | Yes | Read-only library mount, separate writable assets/config mounts, and no host Docker socket mount. |
| V5 Input Validation | Yes | Compose required-variable guards reject empty deployment inputs. |
| V6 Cryptography | Yes | Operator creates high-entropy secrets; no custom cryptography or tracked secret file. |

### Known Threat Patterns for Compose / CI

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Secret disclosure in CI logs, Compose render, docs or UAT handoff | Information disclosure | Use GitHub/Portainer secrets, never echo them, and record variable names only. |
| Untrusted mutable image tag | Tampering | Pin the operator-facing beta tag and document the authoritative GHCR location; never use `latest`. |
| Source library mutation | Tampering | Bind mount library `:ro`; keep resources/assets/config separate. |
| UAT collides with development service/volume | Tampering / availability | Unique temporary project, container, network, port and volume names; never use permanent `pgdp-*`. |
| Optional registry credential missing | Availability | Conditional Docker Hub route, unconditional GHCR route. |

## Sources

### Primary (HIGH confidence)
- [Repository `.github/workflows/build.yml`](../../../.github/workflows/build.yml) - current release event, validation gap, Buildx/QEMU, metadata and registry behavior. [VERIFIED: codebase grep]
- [Repository `examples/portainer-stack.yml`](../../../examples/portainer-stack.yml), [entrypoint](../../../docker/init_scripts/init) and [Dockerfile](../../../docker/Dockerfile) - current source-build stack, startup, migrations, internal Valkey and persistence behavior. [VERIFIED: codebase grep]
- [Docker multi-platform GitHub Actions guide](https://docs.docker.com/build/ci/github-actions/multi-platform/) - QEMU/Buildx and amd64/arm64 build pattern. [CITED: https://docs.docker.com/build/ci/github-actions/multi-platform/]
- [Docker Compose variable interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) - required/default substitution forms and rendered config behavior. [CITED: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/]
- [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/) - health-gated `depends_on` semantics. [CITED: https://docs.docker.com/compose/how-tos/startup-order/]
- [Portainer stack deployment](https://docs.portainer.io/user/docker/stacks/add) - Compose stacks and stack variables. [CITED: https://docs.portainer.io/user/docker/stacks/add]
- [GitHub Actions release events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) - published releases include prereleases. [CITED: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows]
- [Docker metadata action](https://github.com/docker/metadata-action) - SemVer prerelease and `latest` metadata behavior. [CITED: https://github.com/docker/metadata-action]

### Secondary (MEDIUM confidence)
- [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) - secret context and repository secret handling. [CITED: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets]

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, current repository implementation and official Docker/GitHub/Portainer documentation agree.
- Architecture: HIGH, application startup and volume behavior are directly inspectable in tracked Docker files.
- Pitfalls: HIGH, derived from current workflow/entrypoint behavior and Compose documentation.

**Research date:** 2026-11-10
**Valid until:** 2026-11-17, because action and Portainer image versions change quickly.
