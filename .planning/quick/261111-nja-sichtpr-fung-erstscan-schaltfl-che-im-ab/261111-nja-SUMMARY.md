---
id: 261111-nja
title: Repair completed-setup first-scan navigation
status: complete
job_id: 261111-98c5
phase_dir: .planning/phases/44-za-setup-assistant-folder-exclusions-and-platform-search
completed: 2026-11-11
---

# Repair completed-setup first-scan navigation Summary

The setup route guard now treats a completed administrator setup status as the
authoritative condition for leaving the completion page, including when the
heartbeat still requests the setup wizard.

## Implementation

- Reordered the guard so authenticated administrators confirm setup status before
  a stale wizard heartbeat can redirect an exit navigation.
- Retained fail-closed setup redirects for anonymous users, non-administrators,
  incomplete setup, and an unavailable setup-status response with a wizard
  heartbeat.
- Documented the authoritative completion-status exception in the frontend
  routing architecture.

## Verification

- `git diff --check` passed before the source commit.
- Authenticated Playwright inspection used the normal login form at 1440 px and
  390 px. Pointer and keyboard activation of `Ersten Scan starten` each reached
  `/scan`, rendered the scan view, and recorded zero console errors and failed
  requests after login.
- Screenshots and the per-flow UAT report are retained outside the repository in
  the job evidence directory.
- No test or test suite was created, modified, weakened, or executed.

## Commits

- `07f0050d2` fixes completed-setup navigation and updates routing documentation.

## Self-Check: PASSED

- `Setup.vue` still routes `Ersten Scan starten` to `ROUTES.SCAN`.
- The setup guard allows confirmed completed administrators to leave `/setup`.
