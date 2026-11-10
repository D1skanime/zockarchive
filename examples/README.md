# ZockArchive deployment examples

## Retained Git-source stack

Use `portainer-stack.yml` from Portainer's **Stacks > Add stack > Git repository** flow.

- Repository: <https://github.com/D1skanime/zockarchive.git>
- Reference: `main` or a reviewed release revision
- Compose path: `examples/portainer-stack.yml`

Copy `portainer.env.example` into Portainer's environment section. Replace placeholders and create the host directories first. The Docker daemon must be able to read the source archive, mounted read-only in the container.

The stack builds the selected Git revision using `docker/Dockerfile`. `PGDP_IMAGE` defaults to the existing local tag `pc-game-download-portal:portainer`. It is not an advertised public image. Preserve project, service, database, volume and host-path overrides.

`docker-compose.example.yml` is a manual prebuilt-image example. Its local `pc-game-download-portal:latest` tag must already be built or supplied by an operator who verified its provenance. It is not the independent release contract.

## Independent release-image stack

Use `portainer-release.yml` with Portainer's stack editor or upload flow after a reviewed beta release is published. It pulls `ghcr.io/d1skanime/pc-game-download-portal:0.1.0-beta.1` by default. `:beta` is the beta alias. Never use `:latest` for this stack.

Set every required variable named by `portainer-release.env.example` in Portainer's protected stack environment. The image-only stack has no build context and needs no Git checkout. Its `ZA_LIBRARY_PATH` bind mount is read-only; `ZA_ASSETS_PATH` and `ZA_CONFIG_PATH` are writable operator-owned paths. It preserves MariaDB, Valkey, and application resources in named volumes. On an empty database, the existing application entrypoint runs migrations and the browser opens first-user setup.

Keep this contract separate from the Git-source stack. Updates change only the reviewed exact `ZA_IMAGE_TAG` and retain the same named volumes and bind mounts. Docker Hub is optional and does not affect the authoritative GHCR release when its two workflow credentials are absent.

Optional provider credentials may remain blank. ScreenScraper source builds need the two `PGDP_SCREENSCRAPER_DEV_*` build inputs as well as personal credentials.

See the [English installation guide](../docs/PORTAINER_INSTALL.md) for retained operator keys, backups, updates and external verification limits.
