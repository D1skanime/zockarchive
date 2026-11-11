---
quick_id: 261111-eux
status: complete
phase: 43
---

# Quick Task: Refresh the expired Portainer CE setup-token handoff

## Scope

The retained Portainer CE initial-admin token expired before human UAT. Replace
only the explicitly authorized temporary Portainer resources with a fresh
instance on the existing fixed port, then give the live-UAT operator a
secret-safe, minimal way to complete its initial-admin screen. The one-time
setup token must never be read by the agent, persisted in a report, screenshot,
commit, terminal transcript, or planning artifact. The ZockArchive stack stays
undeployed.

## Tasks

1. Replace exactly the expired temporary Portainer resources: stop and remove
   container `za261110-human-portainer`, remove only volume
   `za261110-human-portainer-data`, then recreate the same container and volume
   with the existing fixed `127.0.0.1:49000` binding. Do not inspect or print
   the startup log, do not read the token, and do not touch any other container,
   volume, network, image, or UAT stack. Recreate the keep manifest at
   `$TMPDIR/ki-uat-keep.txt` with the exact retained container, volume, network,
   and UAT path entries required by ki-run.
2. Update only
   `/home/d1sk/ki-run/data/jobs/za/261110-0413/portainer-uat-handoff.md` with
   the refreshed fixed URL/resource details and a short German "Einmaliger
   Setup-Token" section directly after the SSH tunnel. Explain that the token
   expires quickly, so the human must retrieve it locally from the fresh
   container's startup logs immediately before entering it into the Portainer
   form. The agent must not execute that retrieval. State that the token is
   entered once and never written to a file, report, screenshot, commit,
   browser note, or shared log. Keep the local image, stack file, and variable
   instructions intact and state that no stack is pre-deployed.
3. Immediately use the browser at 1440 px and 390 px to confirm the refreshed
   URL shows the initial-admin/setup-token form, without entering credentials
   or deploying a stack. Save only secret-free screenshots outside the
   repository. Update
   `.planning/quick/261111-eux-document-the-portainer-ce-setup-token-ha/SUMMARY.md`
   from its prior `incomplete` status to a truthful completed record of both
   the observed expiry and this authorized replacement. Update the
   corresponding `261111-eux` row in `.planning/STATE.md`. Commit only that
   quick task's plan/summary and STATE update; the external handoff and keep
   manifest remain outside the repository and are excluded from Git.

## Guardrails

- Do not read, print, store, or transmit the setup token.
- Only `za261110-human-portainer` and
  `za261110-human-portainer-data` may be replaced, as explicitly authorized.
  Do not modify, inspect, remove, or restart any other runtime resource.
- Do not deploy a ZockArchive stack or run tests/test suites.
- Do not modify product source, release files, Docker configuration, or any
  paths other than the external handoff and the listed quick artifacts/state.

## Verification

- The external handoff documents the fixed Portainer URL, expiry behavior, and
  a secret-safe one-time-token procedure, but contains no token value.
- `$TMPDIR/ki-uat-keep.txt` retains exactly the freshly recreated temporary
  Portainer resources and the existing UAT path.
- Browser screenshots show the initial-admin/setup-token page at 1440 px and
  390 px and contain no credentials or token.
- `git diff --check` passes for the repository artifacts and `git status`
  confirms the external handoff and keep manifest are not staged.
