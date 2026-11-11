---
quick_id: 261111-eux
status: in_progress
phase: 43
---

# Quick Task: Document the Portainer CE setup-token handoff

## Scope

Give the live-UAT operator a secret-safe, minimal way to complete the retained
Portainer CE initial-admin screen. The one-time setup token must never be read
by the agent, persisted in a report, screenshot, commit, terminal transcript,
or planning artifact. Keep the retained Portainer container and the undeployed
ZockArchive stack unchanged.

## Tasks

1. Update only
   `/home/d1sk/ki-run/data/jobs/za/261110-0413/portainer-uat-handoff.md` with
   a short German "Einmaliger Setup-Token" section directly after the SSH
   tunnel. Give the human a command/procedure that transfers the token from the
   Docker host straight into their local clipboard or private interactive
   terminal without the agent executing, reading, or recording it. State that
   the value is entered once in the Portainer form and must never be copied into
   reports, screenshots, commits, browser notes, or shared logs. Retain the
   fixed address, container name, stack-file path, variables, and local-image
   details already recorded in the handoff.
2. In a browser, revisit the retained initial-admin page at desktop and mobile
   widths without entering credentials or deploying a stack. Confirm that the
   handoff address reaches the setup-token form and capture only secret-free
   screenshots outside the repository. Do not inspect container logs or
   execute a token-retrieval command.
3. Write `SUMMARY.md` in this quick-task directory and update only the "Quick
   Tasks Completed" row in `.planning/STATE.md`. Record that the handoff and
   initial-admin form were checked, while omitting all token values and other
   secret material. Commit the quick artifacts and STATE update only; the job
   handoff report remains outside the repository and is excluded from Git.

## Guardrails

- Do not read, print, store, or transmit the setup token.
- Do not modify, restart, inspect, or remove the retained Portainer container,
  its volume, its network, or any UAT stack resources.
- Do not deploy a ZockArchive stack or run tests/test suites.
- Do not modify product source, release files, Docker configuration, or any
  paths other than the external handoff and the listed quick artifacts/state.

## Verification

- The external handoff documents the fixed Portainer URL and a secret-safe
  one-time-token procedure, but contains no token value.
- Browser screenshots show the initial-admin/setup-token page at 1440 px and
  390 px and contain no credentials or token.
- `git diff --check` passes for the repository artifacts and `git status`
  confirms the external handoff is not staged.
