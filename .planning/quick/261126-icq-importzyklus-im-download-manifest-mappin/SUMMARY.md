---
status: complete
---

Moved the lazy manifest mapping resolver out of the filesystem package so database
handler imports no longer initialize filesystem while metadata imports it. A fresh
disposable MariaDB process loaded normal pytest conftest collection and passed the 54
affected manifest handler and endpoint tests with zero failures and zero errors.
