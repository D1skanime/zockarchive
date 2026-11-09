---
id: 261107-pwz-browser-preview-startfehler-auf-scan-beh
title: Repair the scan preview bootstrap error
status: in_progress
---

# Quick Plan: Repair the Scan Preview Bootstrap Error

Diagnose the `TypeError: t.find is not a function` that prevents the production preview from opening `/scan`. Apply the smallest source-level repair to the identified boundary, without changing scan behavior or adding tests before live UAT.

## Steps

1. Reproduce the production-preview startup failure and trace the generated error to its source component or dependency contract.
2. Repair only the identified incorrect runtime value or component contract.
3. Run the permitted typecheck/build and a browser smoke check of `/scan`; record actual results and any independent build blocker.
