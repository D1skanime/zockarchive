# ZockArchive Portainer installation

This guide covers two separate Portainer contracts for PC and console libraries. Keep filled environment files and secrets outside Git.

- The retained Git-source [stack](../examples/portainer-stack.yml) builds a reviewed repository revision with the `PGDP_*` variables documented below.
- The independent image-only [release stack](../examples/portainer-release.yml) pulls a reviewed release image with its separate `ZA_*` variable inventory in [portainer-release.env.example](../examples/portainer-release.env.example).

Do not mix their Compose files, variable prefixes, volume names, or update procedures. The release image path does not require a Git checkout, source build, or manual database command.

## Storage and prerequisites

Use a Docker host with Portainer support for Git-based Compose stacks, enough build/database storage, and three existing absolute host directories.

| Input               | Container target  | Access                            |
| ------------------- | ----------------- | --------------------------------- |
| `PGDP_LIBRARY_PATH` | `/romm/library`   | Read-only source archive          |
| `PGDP_ASSETS_PATH`  | `/romm/assets`    | Writable assets, saves and states |
| `PGDP_CONFIG_PATH`  | `/romm/config`    | Writable configuration            |
| `pgdp_resources`    | `/romm/resources` | Persistent managed resources      |
| `pgdp_redis_data`   | `/redis-data`     | Persistent Redis/Valkey state     |
| `pgdp_mysql_data`   | `/var/lib/mysql`  | Persistent MariaDB catalog        |

Paths must exist on the Docker host, not only on an administrator workstation. Keep the source archive outside Git and separate from writable application targets.

Synology example paths, not universal defaults:

```text
/volume1/Games
/volume1/docker/pc-downloadportal/assets
/volume1/docker/pc-downloadportal/config
```

For QNAP use actual storage-pool/share paths exposed to its Docker daemon. Linux examples are `/srv/pgdp/library`, `/srv/pgdp/assets` and `/srv/pgdp/config`. Confirm ownership and read/write access before deploying. Existing paths remain valid under the ZockArchive name.

## Create the Git stack

1. Open **Stacks > Add stack > Git repository**.
2. Use repository <https://github.com/D1skanime/zockarchive.git>.
3. Select `main` or a reviewed tag/commit.
4. Set Compose path to `examples/portainer-stack.yml`.
5. Copy the template into the protected stack environment.
6. Replace required placeholders and host paths.
7. Confirm the library mount has `:ro` and writable targets are separate.
8. Review the revision and storage settings, then deploy.

Build context `..` resolves from `examples/` to the repository root. The stack builds `docker/Dockerfile`, target `full-image`. `PGDP_IMAGE` defaults to `pc-game-download-portal:portainer`, the local tag for that build. Preserve existing overrides. A deliberate prebuilt-image deployment requires separate provenance/version verification.

## Deploy the independent release image

Use this path only after a reviewed beta release has been published. In Portainer, open **Stacks > Add stack > Web editor** or upload [portainer-release.yml](../examples/portainer-release.yml), then copy the names from [portainer-release.env.example](../examples/portainer-release.env.example) into the protected stack environment. The tracked template is intentionally value-free.

Set all required `ZA_*` values before deployment:

- `ZA_DB_PASSWORD`, `ZA_DB_ROOT_PASSWORD`, and `ZA_AUTH_SECRET_KEY` are independent high-entropy secrets.
- `ZA_LIBRARY_PATH`, `ZA_ASSETS_PATH`, and `ZA_CONFIG_PATH` are existing absolute paths on the Docker host.
- Optional `ZA_*` provider values enable their matching metadata providers. Leave them empty when the provider is not configured.

The normal release image is `ghcr.io/d1skanime/pc-game-download-portal:0.1.0-beta.1`. The `:beta` alias is also available for the approved beta series. Never use `:latest`. An image source other than the reviewed GHCR release is **unverified** and must not be deployed. Portainer rejects missing required variables before it starts a partial stack. `ZA_IMAGE_REPOSITORY` is reserved for the isolated local proof and should remain unset for an ordinary release deployment.

The release stack starts ZA only after its MariaDB and Valkey services are healthy. It keeps the established application entrypoint, which applies migrations and owns empty-database initialization. For a new database, open the configured URL after the services are healthy and complete the browser first-user setup. Do not run SQL manually.

### Release-image storage and updates

The release stack owns these state boundaries:

| State                         | Storage                              | Update rule                                            |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------ |
| Catalog and users             | `za_mariadb_data` named volume       | Retain it across ZA image updates.                     |
| Queue and cache state         | `za_valkey_data` named volume        | Retain it across ZA image updates.                     |
| Managed application resources | `za_resources` named volume          | Retain it across ZA image updates.                     |
| Operator configuration        | `ZA_CONFIG_PATH` writable bind mount | Back up and retain the same host path.                 |
| Assets, saves, and states     | `ZA_ASSETS_PATH` writable bind mount | Back up and retain the same host path.                 |
| Source game library           | `ZA_LIBRARY_PATH:/romm/library:ro`   | Keep it read-only and outside application-owned state. |

To update the release-image stack, review the target release, change only `ZA_IMAGE_TAG` to its exact reviewed tag, and redeploy while retaining all named volumes and bind mounts. Verify health, login, and a small authorized library action afterwards. Replacing volumes or host paths creates a different state boundary and is not an update.

Docker Hub is optional for the release workflow. Its login and push occur only when both Docker Hub credentials are configured as GitHub repository secrets. Missing Docker Hub credentials do not prevent the authoritative GHCR publication.

## Existing installations and Git URL changes

Update the existing stack's Git URL to <https://github.com/D1skanime/zockarchive.git> during an authorized maintenance window. Retain reference, Compose path, project/container overrides, environment values, host paths and volumes. Review the revision before rebuilding.

A source rename does not move the canonical development checkout `/home/d1sk/pc-game-download-portal` or migrate registry packages and Docker storage. Do not create a differently named replacement stack and assume it reuses the same data. Portainer changes are operator actions, not performed by reading this guide.

## Retained operator settings

All `PGDP_*` and `ROMM_*` keys retain their exact names and values.

| Setting                  | Existing default or purpose                          |
| ------------------------ | ---------------------------------------------------- |
| `PGDP_PROJECT_NAME`      | `pgdp`, Compose project                              |
| `PGDP_CONTAINER_NAME`    | `pgdp`, application container                        |
| `PGDP_DB_CONTAINER_NAME` | `pgdp-db`, database container                        |
| `PGDP_IMAGE`             | `pc-game-download-portal:portainer`, local build tag |
| `PGDP_DB_NAME`           | `pgdp`                                               |
| `PGDP_DB_USER`           | `pgdp-user`                                          |
| `PGDP_HTTP_PORT`         | `8080`, internal port remains 8080                   |
| `PGDP_TZ`                | `UTC`                                                |
| `PGDP_DB_PASSWORD`       | Required application database password               |
| `PGDP_DB_ROOT_PASSWORD`  | Required separate MariaDB root password              |
| `PGDP_AUTH_SECRET_KEY`   | Required persistent authentication secret            |

Services remain `pgdp` and `pgdp-db`. Keep `pgdp_mysql_data`, `pgdp_resources` and `pgdp_redis_data`. Compose may prefix actual volumes with the project name. Do not recreate them to change branding.

For a fresh installation generate separate strong values, for example using `openssl rand -hex 32`. Existing installations retain authentication secrets and database credentials unless following a separate credential-rotation procedure. Never paste secrets into issues, screenshots or logs.

## Optional providers

Portainer inputs use the `PGDP_` prefix and map to existing runtime keys. Empty credentials leave that provider unavailable while base library/login operation remains usable.

- `PGDP_SCREENSCRAPER_USER` and `PGDP_SCREENSCRAPER_PASSWORD`: personal credentials.
- `PGDP_SCREENSCRAPER_DEV_ID` and `PGDP_SCREENSCRAPER_DEV_PASSWORD`: source-build application credentials, passed to Docker build arguments. Store in the protected stack environment or a secret store, and rebuild after changes.
- `PGDP_RETROACHIEVEMENTS_API_KEY`: RetroAchievements access.
- `PGDP_STEAMGRIDDB_API_KEY`: personal SteamGridDB API key.
- `PGDP_IGDB_CLIENT_ID` and `PGDP_IGDB_CLIENT_SECRET`: Twitch developer application credentials for IGDB.
- `PGDP_HASHEOUS_API_ENABLED`: optional Hasheous integration switch.

Upstream RomM images and embedded application credentials belong to upstream. Do not assume they are available in this source build. ScreenScraper may reject an unconfigured source build with HTTP 403.

Get credentials from each provider's account/developer portal. IGDB uses a Twitch developer application. ZockArchive renews tokens internally using client ID/secret. See [IGDB documentation](https://api-docs.igdb.com/) and [SteamGridDB API documentation](https://www.steamgriddb.com/api/v2).

## Startup and a bounded check

1. Wait for `pgdp-db`, then `pgdp`, to become healthy.
2. Open the configured host port, such as `http://<NAS-IP>:8080`.
3. Complete first-user setup or sign in.
4. Check a platform mapping beneath the read-only library root.
5. Scan a small authorized test library and check metadata.
6. Test configured providers, DLC presentation and a small download.
7. Compare source contents and directory structure before and after.

The entrypoint prepares the environment and applies migrations. Ordinary startup needs no manual schema command. If startup fails, check required variables and writable target permissions. Access times can change during reads; see [read-only operations](external-read-only-library-operations.md).

## Updates, backups and rollback

Back up catalog and managed state using your database-aware backup procedure:

- Actual project-prefixed `pgdp_mysql_data`, `pgdp_resources` and `pgdp_redis_data` volumes.
- `PGDP_ASSETS_PATH` and `PGDP_CONFIG_PATH`.
- Stack settings, path overrides and secrets in a secure recovery store.

The source archive follows your separate NAS backup policy. Never delete, replace or copy it into Git during updates.

Select the reviewed revision, rebuild and redeploy the existing stack with the same identities/storage. Recheck health, login, library and a small download. For rollback select the previous known revision and reuse state only where schema compatibility permits. Code rollback is not database rollback. Restore a matching backup using a version-compatible procedure when required.

## Image publication and support ownership

The future release workflow publishes the authoritative image to `ghcr.io/d1skanime/pc-game-download-portal` after a human-approved published release. It emits exact release and beta tags, never `latest`. This documentation change does not publish an image or establish package access. Repository redirects do not establish registry redirects or package migration.

Use [ZockArchive issues](https://github.com/D1skanime/zockarchive/issues), [releases](https://github.com/D1skanime/zockarchive/releases) and repository docs. [Upstream RomM](https://github.com/rommapp/romm) remains the origin. Its docs, community and donation accounts belong to upstream.

## Troubleshooting and verification limits

- Required variable missing: check exact keys and replace placeholders.
- Empty library: check host path and read permissions.
- Failed mapping/scan: check the authorized relative platform folder.
- Unwritable assets/config: check separate writable host directories.
- Unhealthy database: check matching credentials and persistent volume.
- Missing metadata: check selected provider credentials and container DNS/HTTPS.
- Old version: check Git revision and whether the application was rebuilt.

Run `bash scripts/verify-portainer-stack.sh` in the canonical Linux checkout to render and inspect the template. It does not deploy. Static/synthetic checks do not establish live Synology, QNAP, production Portainer, NAS or physical hardware acceptance. Supplied artwork and platform-specific installer proof remain separate work.
