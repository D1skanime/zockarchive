---
quick_id: 261106-9z8
wave: 1
depends_on: []
---

# Recover the ZA UAT backend

1. Declare the owner foreign key for both owned-media reverse ORM
   relationships so the active-cover foreign keys cannot make mapper setup
   ambiguous.
2. Run the scoped static check and restart only the existing ZA development
   container. Prove the backend heartbeat is reachable before any browser
   check.
3. Record the recovery in the planning state and phase verification. Do not
   run a test suite before UAT.
