---
quick_id: 261115-2p0
status: complete
phase: 44
---

# Post-UAT Phase 44 logic tests

## Coverage

- Storage readiness treats the expected `platform_mapping_missing` conflict as
  an absent mapping, while preserving unrelated assignment conflicts for the
  caller.
- The shared direct-folder readiness resolver sends only persisted active
  direct platform assignments to the storage readiness service. Exclusions and
  incomplete assignments do not block scans.
- The generic storage-mapping projection does not request or display direct
  folder assignments or exclusions, leaving them to the Games projection.
- The Home readiness contract follows the shared direct-folder resolver.

## Verification

- Focused Vitest run: 4 files and 25 tests passed.
- Isolated Phase 34 backend run: 27 endpoint and integration tests passed;
  disposable containers, volumes, and network were removed cleanly.
- No product files changed.
