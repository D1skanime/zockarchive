---
quick_id: 261118-grp
status: complete
---

# Owned-content proof timeout visibility

1. Trace the owned-content proof call path used by a durable scan and reproduce
   its bounded verifier timeout in isolated temporary data without accessing
   the NAS.
2. Keep proof rejection strict, record a confirmed per-game failure and timeout
   counter when the scan has an unambiguous ROM context, then finish the durable
   operation as failed after retaining other completed work.
3. Show the confirmed timeout, game and platform in the operation UI, update the
   backend/frontend architecture documentation, and inspect the available status
   flow at desktop and mobile widths.
