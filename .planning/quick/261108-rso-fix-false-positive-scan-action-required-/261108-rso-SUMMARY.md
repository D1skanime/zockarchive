---
quick_id: 261108-rso
status: complete
phase: 41
---

# Fix false positive scan action-required results

MariaDB/MySQL JSON boolean conversion treated an absent
`inventory_status.identified_windows` key as false. The projection and
inventory aggregate now compare its JSON text to `"false"`, so only an
explicit durable false value is classified as unidentified.

This one predicate drives action-required totals, samples, result filtering,
and the visible item classification. Failed and warning items retain their
action-required behavior. Skipped items with no Windows inventory fact remain
in the skipped filter only.

The local MariaDB 11.3 test instance and the saved 37-game scan were inspected
in Chromium at 1440 px and 390 px. The action-required query returned HTTP 200
with zero rows; the skipped query returned HTTP 200 with all 37 skipped rows.
Frontend typecheck, the focused post-UAT frontend tests (66 passing), and an
owned-temporary production build passed. No new tests were added after the
live-UAT correction request.
