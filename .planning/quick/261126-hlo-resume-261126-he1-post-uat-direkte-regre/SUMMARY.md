---
status: complete
---

Removed the PC and PS3 exception from the common ready and preparable shared-download
capability predicates. Eligibility now requires persisted total size evidence of at
least 4,000,000,000 bytes on every platform, before member selection; manifest
selection remains independent of the selected byte total.

Direct regression coverage now includes FOLDER selection capture, universal PC/PS3/
additional-platform boundaries, summed small members, and preparable legacy boundaries.
The isolated targeted run passed 76 tests with zero failures and zero errors. Focused
Trunk lint, frontend typecheck, and frontend production build also passed. The build
reported existing CSS/dependency warnings but completed successfully.
