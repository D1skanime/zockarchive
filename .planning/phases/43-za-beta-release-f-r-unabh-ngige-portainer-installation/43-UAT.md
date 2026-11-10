# Phase 43 isolated UAT receipt

This receipt covers only the local, isolated Phase 43 UAT resources. It is not a release, tag, publication, registry login, deployment, or acceptance record. The protected runner-local environment is intentionally not named here and no secret, cookie, token, rendered Compose configuration, or cleanup result is recorded.

receipt_schema=za-phase43-receipt-v1
uat_project=za-phase43-uat-db73013a19c1481c5fdd95cf
local_image_tag=za-phase43-uat:db73013a19c1481c5fdd95cf
local_image_id=sha256:d9da21269513d7cb351144022d0cfef32078cfadf00ba425b43936820ef4ed7e
za_base_url=http://127.0.0.1:44753
portainer_base_url=http://127.0.0.1:52533
before.database_setup_id=za-admin-db73013a19c1481c5fdd95cf
after.database_setup_id=za-admin-db73013a19c1481c5fdd95cf
before.database_setup_state=complete
after.database_setup_state=complete
before.config_marker_name=za-phase43-config-marker.txt
after.config_marker_name=za-phase43-config-marker.txt
before.config_marker_sha256=f768939f1c6248cc42ec3761dee834ffd421a5028d0c6dea6089616dad89eebc
after.config_marker_sha256=f768939f1c6248cc42ec3761dee834ffd421a5028d0c6dea6089616dad89eebc
before.managed_resource_id=3
after.managed_resource_id=3
before.managed_resource_url=/api/roms/1/media/3/content
after.managed_resource_url=/api/roms/1/media/3/content
before.valkey_key=za-phase43-uat:token:persistence
after.valkey_key=za-phase43-uat:token:persistence
before.valkey_value_sha256=8e0e64e7eb8143f9f5e0f4d45656d5a3a793f2a5ac3541f809812689112fdbf8
after.valkey_value_sha256=8e0e64e7eb8143f9f5e0f4d45656d5a3a793f2a5ac3541f809812689112fdbf8
before.za_browser_url=http://127.0.0.1:44753/setup
after.za_browser_url=http://127.0.0.1:44753/setup
before.za_browser_condition=completed-setup-visible-with-sample-library-assignment
after.za_browser_condition=completed-setup-routes-to-authenticated-login-without-wizard
portainer_api_url=http://127.0.0.1:52533/api/status
portainer_api_condition=http-200-json-Version
portainer_browser_url=http://127.0.0.1:52533/#!/init/admin
portainer_browser_condition=initial-administrator-form-visible

## Human UAT handoff

- ZA route: `http://127.0.0.1:44753`. The temporary administrator credential is held only in protected runner-local temporary state and is not recorded in this receipt.
- Portainer route: `http://127.0.0.1:52533/#!/init/admin`. The initial-administrator form is visible and has not been completed.
- Stack file: `examples/portainer-release.yml`.
- Local image: `za-phase43-uat:db73013a19c1481c5fdd95cf`, bound to the receipt image ID above.
- Portainer variable names only: `ZA_IMAGE_REPOSITORY`, `ZA_IMAGE_TAG`, `ZA_DB_NAME`, `ZA_DB_USER`, `ZA_DB_PASSWORD`, `ZA_DB_ROOT_PASSWORD`, `ZA_AUTH_SECRET_KEY`, `ZA_LIBRARY_PATH`, `ZA_ASSETS_PATH`, `ZA_CONFIG_PATH`, `ZA_HTTP_PORT`, `ZA_TZ`, `ZA_SCREENSCRAPER_USER`, `ZA_SCREENSCRAPER_PASSWORD`, `ZA_RETROACHIEVEMENTS_API_KEY`, `ZA_STEAMGRIDDB_API_KEY`, `ZA_IGDB_CLIENT_ID`, `ZA_IGDB_CLIENT_SECRET`, and `ZA_HASHEOUS_API_ENABLED`.
- Isolated sample-library handoff location: `/home/d1sk/ki-run/data/jobs/za/261110-0413/tmp/za-phase43-261110-0413/library`.
- Browser evidence was captured with temporary `za-phase43-*` Playwright containers and inspected locally: the initial setup wizard, completed setup state, post-recreate login state with the persisted sample-ROM cover, and Portainer initial-administrator form.

## Persistence result

An authenticated temporary browser session uploaded one harmless generated 1×1 PNG cover through the existing `POST /api/roms/1/media/upload` workflow using the application's CSRF cookie/header mechanism. The resulting managed resource `id=3` and application-visible content route above were read before and after recreating only ZA; both reads returned the same identifier and route, and the post-recreate route returned `image/png`. Database setup, config marker, and Valkey state were also compared equal before and after the ZA-only recreation.

The direct host `npm run build` failed in the existing PWA Workbox generation step because the pre-existing `frontend/dist` directory is empty, owned by `nobody:nogroup`, and not writable by the runner. Vite therefore leaves no matching generated assets for Workbox. This is a historical local generated-output condition, not a Phase 43 source or release-image-path change. Equivalent supported production evidence passed with `npm run build -- --outDir /home/d1sk/ki-run/data/jobs/za/261110-0413/tmp/za-phase43-261110-0413/frontend-dist`; it generated the production index and PWA service-worker files without modifying `frontend/dist`. The image's clean production frontend build also succeeded during the verified amd64 `full-image` Docker build. The optional arm64 Buildx attempt failed in the Alpine emulator-stage `apk add` command with exit 255 and remains non-blocking.

## Scope and teardown

Human acceptance, Git tags, GitHub releases, registry publication, push, permanent deployment, Team4s/NAS access, `pgdp-*` changes, and cleanup remain out of scope. Do not run teardown before human UAT. When separately authorized, teardown may target only the recorded `za-phase43-uat-db73013a19c1481c5fdd95cf` Compose project, `za-phase43-portainer-db73013a19c1481c5fdd95cf` container, and `za-phase43-portainer-data-db73013a19c1481c5fdd95cf` volume.
