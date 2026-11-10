---
quick_task: 261110-hpm
status: complete
---

# Serialize UI setting persistence summary

`useUISettings` now queues per-instance persistence requests. Rapid successive
toggle changes therefore reach the backend in edit order, while the existing
account and newest-response guards still prevent stale state from replacing the
active account.

Browser rechecks at 1440 px and 390 px confirmed that a rapid final `false`
value survives a hard reload. The real login, keyboard switch interaction and
all seven Storybook compositions rendered successfully. No tests were added or
run before live acceptance; the attempted typecheck produced no diagnostics but
did not complete within the command time window.
