---
quick_id: 261113-bem
status: complete
phase: 44
---

# Release provider-variable alignment

The image-only Portainer contract now accepts the setup-visible runtime provider
names for IGDB, MobyGames, and the Steam setting family. Matching legacy `ZA_`
inputs remain fallbacks, while a direct runtime input takes precedence. The release
MariaDB healthcheck keeps its health and dependency behavior without
`start_interval`.

## Changed files

- `examples/portainer-release.yml` forwards direct and legacy-compatible provider inputs.
- `examples/portainer-release.env.example`, `examples/README.md`, and
  `docs/INSTALLATION_PORTAINER.md` document the single operator-facing naming rule.
- `docs/BACKEND_ARCHITECTURE.md` records the release-stack compatibility boundary.
- All 18 `frontend/src/locales/*/setup.json` files identify Portainer as the place
  to set the setup-visible provider names.

## Verification

- A value-free Compose validation succeeded with synthetic inputs, and an in-process
  precedence check confirmed direct names win over legacy aliases.
- `start_interval` is absent from the release YAML and `git diff --check` passed.
- A real isolated browser setup flow at 1440 px and 390 px used synthetic provider
  inputs. IGDB, MobyGames, and Steam were rendered as configured rather than
  missing-key providers. The folder platform search and Do not scan controls were
  operated without saving the isolated setup.
- The browser note and screenshots are in the job evidence directory. No tests or
  test suites were run.

## Limitations

Synthetic provider inputs prove setup configuration state, not a successful external
provider authentication. The reserved fresh UAT stack on port 32774 remains unchanged.
