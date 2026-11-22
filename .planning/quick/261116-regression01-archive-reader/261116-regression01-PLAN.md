---
quick_id: 261116-regression01
status: active
---

# Fix archive reader regression

Restore timeout wrapper ownership and support existing non-FD process doubles
without altering the real extractor FD deadline path.
