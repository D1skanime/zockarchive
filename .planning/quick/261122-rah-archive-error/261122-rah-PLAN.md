---
quick_id: 261122-rah
title: Contain RAHasher archive inventory failures
status: complete
---

# RAHasher archive inventory containment

## Scope

Prevent an incomplete archive member inventory used only for the optional
RetroAchievements hash from escaping into a platform scan.

## Steps

1. Preserve `ArchiveReadError` as the integrity signal from archive listing.
2. Handle that signal at the RAHasher optional-hash boundary and return no RA
   hash for the affected ROM only.
3. Align the extraction helper contract, lint the changed backend files,
   inspect the scan page in the browser, then document and commit the result.

## Acceptance criteria

- No member inventory error reaches platform-level scan orchestration through
  RAHasher.
- The source, manifest, and archive-integrity signals stay unchanged.
- The extraction helper documents its actual `ArchiveReadError` behavior.
