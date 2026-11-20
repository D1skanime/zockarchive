---
quick_id: 261120-oxx
title: Prevent a completed PC subfolder scan from being rediscovered and falsely matched
status: in_progress
---

# Prevent a completed PC subfolder scan from being rediscovered and falsely matched

## Scope

Reproduce the reported `Tales Of` subfolder selection followed by a quick scan,
then ensure successful child promotion retires the parent container before any
later discovery can submit it to metadata matching. Preserve multi-child
collection behavior and existing scan request semantics.

## Tasks

1. Trace the frontend request and the mapping-backed collection finalization
   path for the selected child, including the durable operation completion
   boundary that owns parent retirement.
2. Correct the earliest proven lifecycle gap so a completed child scan records
   the collection classification and cannot leave the parent eligible for a
   subsequent quick scan.
3. Update architecture documentation for the durable collection boundary if
   the ownership contract changes.
4. Run typecheck, scoped lint/build, then exercise the selection and following
   quick-scan flow in the supplied Dev browser at desktop and mobile widths.
   Record any environment blocker honestly in the UAT report.

## Acceptance

- A completed selected child scan does not let the parent `Tales Of` container
  be rediscovered or matched as `Total War` on the following quick scan.
- Normal quick scans still discover unrelated and multi-child PC containers.
- No stale UI scan selection is carried into the next quick-scan request.
- Documentation explains the collection-finalization invariant.
