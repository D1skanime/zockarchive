# Phase 43: ZA Beta Release for Independent Portainer Installation - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare ZockArchive `v0.1.0-beta.1` for an independent, image-based Portainer installation. The phase delivers a multi-architecture GitHub release workflow, an image-only Portainer stack, automatic first-start initialization, persistence guidance, release notes, an isolated local installation proof, and a temporary Portainer CE UAT environment. It does not create a Git tag or release, publish an image, push, merge, deploy the permanent development stack, or access Team4s or a real NAS mount.
</domain>

<decisions>
## Implementation Decisions

### Release and Image Publication
- The intended first prerelease is `v0.1.0-beta.1`. Repository tag validation accepts the leading `v`; image metadata emits `0.1.0-beta.1` and `beta`, never `latest`.
- The authoritative release image is `ghcr.io/d1skanime/pc-game-download-portal`, because it is the existing package destination tied to the renamed ZockArchive repository. The workflow documents this retained package path.
- GitHub Actions builds and publishes linux/amd64 and linux/arm64 on a published release only. This phase performs no publication action.
- Docker Hub is optional. Its login and push run only when both Docker Hub credentials are configured as repository secrets. A missing Docker Hub configuration must not fail GHCR publication.
- The ScreenScraper developer build arguments are supplied from `SCREENSCRAPER_DEV_ID` and `SCREENSCRAPER_DEV_PASSWORD` GitHub secrets. They intentionally remain embedded in the published image and the resulting disclosure is documented as a known limitation.

### Portainer Deployment Contract
- Add `examples/portainer-release.yml` that pulls an image rather than building source. It starts ZA, MariaDB and Valkey with health-gated dependencies and reuses the established application entrypoint for database migrations and first-start initialization.
- All operator secrets are Portainer stack variables. A value-free release environment example names every required and optional variable. Missing required variables fail clearly before a silent partial startup.
- Named volumes retain MariaDB, resources and Valkey state. Bind mounts retain the operator-selected configuration and a read-only game library. The stack and operator documentation make these update-persistence boundaries explicit.
- The empty-database case is a supported first deployment. No manual database command, Git checkout or source build is part of the operator path.

### Validation and UAT
- Before human UAT, do not add or modify automated tests and do not start test suites. Typecheck/build, an isolated local installation test and direct browser inspection are the required pre-UAT evidence.
- The installation proof builds a local amd64 image from this branch, deploys it with temporary volumes and a separate Compose project using the release stack, exercises setup and a sample library, recreates the application container, and verifies durable database, configuration and media state. Arm64 buildx is attempted only when VM resources allow it.
- Provide a temporary, separately ported Portainer CE instance for human UAT. The handoff records the local image tag, stack file, variables by name, test-library host path and access route without recording any secret values.
- The release notes and installation documentation describe the later human release sequence, the no-Docker-Hub-credentials behavior, and known limitations. No release or image publication is executed in this phase.

### the agent's Discretion
Choose exact Compose variable names, entrypoint guards, build metadata implementation and temporary test resource names from established repository patterns, while keeping secrets out of tracked files, output and planning evidence.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `examples/portainer-stack.yml` and `examples/portainer.env.example` provide the existing Portainer service, volume, bind-mount and variable contracts.
- `docker/Dockerfile` and the application entrypoint already provide the production image and startup migration path.
- `.github/workflows/build.yml` already contains Buildx, QEMU, Docker metadata and ScreenScraper build-argument wiring.

### Established Patterns
- The application waits for a healthy MariaDB service and its normal startup path applies Alembic migrations.
- Operator-owned values are supplied through Compose substitutions and checked shell parameter expansions rather than committed credentials.
- Persistent state uses named volumes for database, resources and Valkey, while game data stays a read-only host mount.

### Integration Points
- Update the release workflow, add the release compose and environment templates, and revise the Portainer and architecture documentation.
- Keep the existing development compose services and permanent `pgdp-*` resources outside the validation project.
</code_context>

<specifics>
## Specific Ideas

The human supplied the complete acceptance path: in Portainer, a user configures required passwords and the library path, deploys the stack, and then completes ZA setup in the browser. The live UAT uses a temporary local Portainer CE instance and the locally built release image, not a published image.
</specifics>

<deferred>
## Deferred Ideas

- Creating the `v0.1.0-beta.1` tag, publishing the GitHub prerelease, and pushing any image happen only after human acceptance and merge.
- Automated workflow and stack tests are intentionally deferred until post-acceptance instruction.
</deferred>
