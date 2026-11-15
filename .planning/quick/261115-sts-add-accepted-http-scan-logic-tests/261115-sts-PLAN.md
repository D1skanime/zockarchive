---
quick_task: 261115-sts
status: complete
---

# Add Accepted HTTP Scan Logic Tests

## Goal

After live UAT approval, cover the accepted HTTP-LAN scan behavior through
direct unit, adapter, and composable calls without changing product code or
using browser-click or snapshot tests.

## Steps

1. Test the UUID helper's native, Web Crypto fallback, and unavailable-entropy
   paths, including RFC 4122 v4 formatting.
2. Test the scan hook's normal and subfolder requests with generated operation
   identifiers, and adapter defaults for cancel, resume, and metadata retry.
3. Run only the new and directly affected frontend tests, record the result in
   SUMMARY and STATE, then commit test and planning files.
