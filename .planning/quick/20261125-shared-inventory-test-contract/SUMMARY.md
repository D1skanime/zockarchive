---
id: 20261125-shared-inventory-test-contract
status: complete
date: 2026-11-25
---

# Shared inventory test contract repair

Replaced stale PS3-only test seams with the shared inventory readiness API.
The focused tests still prove ready inventory is reused, incomplete inventory
is rejected without persistence, and the manifest endpoint maps both readiness
and mapped-source preparation failures to the safe conflict response.

Verification: focused guarded backend run of
`tests/handler/test_scan_folder_download.py` and
`tests/endpoints/test_download_manifests.py` passed. Trunk formatting and
checks passed. No production files changed.
