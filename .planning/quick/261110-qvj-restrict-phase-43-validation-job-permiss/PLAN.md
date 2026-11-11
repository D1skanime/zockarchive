---
id: 261110-qvj
title: Restrict Phase 43 validation job permissions
mode: quick
status: ready
files_modified:
  - .github/workflows/build.yml
  - .planning/phases/43-za-beta-release-f-r-unabh-ngige-portainer-installation/43-REVIEW.md
---

# Quick Task 261110-qvj

1. Give the tag-validation job only `contents: read`; keep package write permission only on the image-publishing job.
2. Record that embedded ScreenScraper developer build credentials are an explicit accepted, documented product limitation, not an unreviewed regression.
3. Run static YAML and permission-scope checks only. Do not build, publish, log in, or run a test suite.
