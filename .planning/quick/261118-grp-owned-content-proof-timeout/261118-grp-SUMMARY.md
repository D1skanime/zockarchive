---
quick_id: 261118-grp
status: complete
---

# Owned-content proof timeout summary

The reproduced `Owned content verification timed out` condition is emitted by
the isolated verifier after its bounded response deadline. This verifier reads
only ZockArchive-owned staged media and generated outputs. It never opens NAS
library game bytes, so the reported production failure is not evidence that a
large PC game or archive was content-hashed by this proof path.

When that exact timeout occurs while a ROM is being scanned, the scanner now
records a failed canonical game item when it can resolve the ROM, with its
existing mapping-derived platform and the safe cause code
`owned_content_verification_timeout`. It increments the distinct
`owned_content_proof_timeouts` counter, continues later ROM work, retains every
completed result, and then transitions the durable operation to `failed` with
`check_storage`. Other proof rejections remain fail-closed and are not
reclassified.

The Scan operation overview renders the dedicated counter. Its actionable
sample renders the known game, platform, and timeout text, and the terminal
status identifies the owned-media verification failure. The normal authenticated
desktop and mobile scan flows, reference dialog, metadata tab, Stop action, and
Library management action were inspected without post-login console or network
errors. The supplied test library has no generated-media candidates, so it
could not produce the full HTTP timeout row; the isolated live-container proof
and terminal projection were verified instead. No NAS, production stack, or
tests were changed.
