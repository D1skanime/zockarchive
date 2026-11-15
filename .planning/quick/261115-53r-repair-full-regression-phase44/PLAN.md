---
quick_id: 261115-53r
status: in_progress
phase: 44
---

# Quick Task: Repair Phase 44 full regression failures

## Evidence

The post-approval full regression reports 27 frontend and 12 MariaDB failures
that are new relative to main. The failures cover stale assertions for accepted
provider, attribution, locale, setup-recovery, scan-request, and multi-mapping
contracts, plus fixtures that still model a scalar storage mapping.

## Plan

1. Compare each failed frontend assertion with the accepted current behavior;
   update only stale test contracts and preserve meaningful error-path checks.
2. Repair backend fixtures or product behavior according to the durable
   multi-mapping model, retaining explicit uniqueness and path-resolution
   contracts.
3. Run the listed affected frontend and MariaDB tests in the isolated runner,
   then update STATE and record the exact outcome.

## Acceptance criteria

- All listed regression failures are resolved without weakening their behavior
  contracts.
- Product code changes, if needed, are limited to the verified root cause and
  trigger the next live-UAT cycle.
- The quick task has a summary, STATE entry, and an atomic commit.
