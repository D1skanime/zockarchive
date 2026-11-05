---
quick_id: 261105-n05
wave: 1
depends_on: []
---

# Restore component resource storage imports

1. Restore the exact existing ownership-storage imports consumed by the media
   content route after the manual-router extraction.
2. Run scoped `trunk check` and `git diff --check`; no tests or test suites.
3. Record the evidence and commit the correction with state tracking.
