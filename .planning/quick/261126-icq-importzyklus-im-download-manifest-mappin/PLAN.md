---
title: Break manifest mapping import cycle
wave: 1
depends_on: []
---

1. Move the lazy manifest-mapping resolver outside the filesystem package initializer.
2. Verify a fresh conftest import and targeted manifest tests in MariaDB.
3. Run focused lint and record the Quick outcome.
