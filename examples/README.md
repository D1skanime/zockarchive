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

Use `portainer-release.yml` with Portainer's stack editor or upload flow after a reviewed beta release is published. It pulls `ghcr.io/d1skanime/zockarchive:0.1.0-beta.1` by default. `:beta` is the beta alias. Never use `:latest` for this stack.

Set the three required secret variables and `ZA_LIBRARY_PATH` from `portainer-release.env.example` in Portainer's protected stack environment. The image-only stack has no build context and needs no Git checkout. Its library bind mount is read-only, while assets and configuration use persistent named volumes by default. Advanced operators can set `ZA_ASSETS_PATH` or `ZA_CONFIG_PATH` to writable absolute host paths instead. It preserves MariaDB, Valkey, and application resources in named volumes. On an empty database, the existing application entrypoint runs migrations and the browser opens first-user setup.

Keep this contract separate from the Git-source stack. Updates change only the reviewed exact `ZA_IMAGE_TAG` and retain the same named volumes and bind mounts. Docker Hub is optional and does not affect the authoritative GHCR release when its two workflow credentials are absent.

Optional provider credentials may remain blank. In the release stack, use the runtime
names displayed by setup: `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`,
`MOBYGAMES_API_KEY`, and the `STEAM_API_*` family. The legacy matching `ZA_`
names remain input aliases for existing Portainer stacks, but direct runtime names
take precedence when both are present. ScreenScraper source builds need the two
`PGDP_SCREENSCRAPER_DEV_*` build inputs as well as personal credentials.

See the [German release installation guide](../docs/INSTALLATION_PORTAINER.md) for deployment, backups and updates. The retained Git-source instructions are in [PORTAINER_INSTALL.md](../docs/PORTAINER_INSTALL.md).
