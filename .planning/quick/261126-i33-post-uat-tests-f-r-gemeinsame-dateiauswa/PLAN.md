---
title: Post-UAT tests for shared file selection
wave: 1
depends_on: []
---

1. Add direct handler coverage for the empty shared-FOLDER selection error path.
2. Run only the affected manifest handler and endpoint tests in the disposable runner.
3. Record the focused result and commit only tests and Quick artifacts.
