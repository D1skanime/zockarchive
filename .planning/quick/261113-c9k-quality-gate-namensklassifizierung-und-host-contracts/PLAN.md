---
quick_id: 261113-c9k
title: Quality-gate naming classification and host contracts
status: complete
---

# Quality-gate naming classification and host contracts

The provider-release documentation added one retained `PGDP_*` compatibility
identifier. The branding contract must classify that exact documentation line
so the fresh-clone naming check and its host contract remain strict.

## Tasks

1. Add the exact reviewed `examples/README.md` compatibility line to the
   retained-name contract. Do not change the naming verifier or its failure
   behavior.
2. Run only the two failed quality-gate commands and `git diff --check`.
   Record their results in the quick summary, without adding tests or running a
   test suite.
3. Update the quick-task summary and the completed-quick-task section in
   `STATE.md`, then commit the scoped fix and artifacts.

## Verification

- `bash scripts/verify-pgdp-naming.sh`
- `python3 backend/tools/ci_host_contracts.py`
- `git diff --check`
