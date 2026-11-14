---
quick_id: 261114-phr
status: in_progress
---

# Avoid exclusion readiness request on Home

## Objective

Remove the post-login and Library Management 409 console and network errors
discovered during scan visual verification. Home and the generic mapping tab
must not request an active mapping for an intentionally excluded direct folder.

## Steps

1. Apply the completed-setup mapped-folder filter to Home readiness and skip
   direct-folder platforms before the generic mapping tab requests legacy
   mappings, without changing exclusions, mappings, or scan requests.
2. Update the shared frontend architecture description and typecheck.
3. Re-run authenticated desktop and mobile browser checks for the login
   transition, Scan action, Library Management link, direct Games tabs, and
   preserved pc/Wii dispositions. Record factual evidence and commit.
