---
quick_id: 261108-te6
status: complete
phase: 41
---

# Restore selective metadata retry actions

The bounded result explorer now owns the selection of retryable warning and
failed rows. It emits only selected item IDs through the existing scan status
boundary; the shared lifecycle snapshot continues to omit result pages. The
former status-panel fieldset was unreachable after result-page separation and
has been removed.

The operation composable accepts safe positive IDs from the explorer without
requiring lifecycle rows that no longer exist. The backend remains authoritative
for operation ownership and retryable outcome validation.

Frontend typecheck and scoped Trunk checks pass. No tests were added or run.
Browser inspection at 1440 px and 390 px used a locally answered warning result
because the saved scan contains only skipped rows: selection showed the retry
action and its browser request contained exactly the selected ID. The retry
POST was locally answered with 409 so the saved scan was not mutated.
