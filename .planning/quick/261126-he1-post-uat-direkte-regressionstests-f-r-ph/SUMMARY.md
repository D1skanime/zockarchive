---
status: blocked
---

Post-UAT regression coverage was added for exact FOLDER manifest-member selection and
for the inclusive shared-download size threshold. The isolated targeted response test
ran on product revision `a465381fd61b5666bf09f0ca9c935acc0a83206b`.

The summed-small-members threshold case passed. The two universal-threshold cases for
Windows and PS3 failed: a one-byte FOLDER still returns `ready`. Fixing that requires a
production change to remove the legacy platform exception, which is prohibited after
the accepted UAT without a new authorization.
