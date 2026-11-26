---
status: blocked
---

The direct transition regression test exposes that a dialog opened while preparable
does not preselect members after its folder capability becomes ready. The focused test
fails only for this new assertion. Making it pass requires a product-code change to the
dialog watcher, which is prohibited after UAT without renewed authorization.
