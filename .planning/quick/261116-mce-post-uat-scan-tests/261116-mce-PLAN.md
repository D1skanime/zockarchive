---
quick_id: 261116-mce
title: Post-UAT scan timeout tests
wave: 1
depends_on: []
status: active
---

# Quick plan

Add direct regression coverage for the accepted mapped archive-timeout flow:
legacy platforms continue through the existing mixed-scan test, while the
operation worker preserves the safe terminal archive-evidence cause. Run only
the affected backend test files and commit test and planning changes.
