---
quick_id: 261113-iyg
status: complete
parent_phase: 44
---

# Reconcile direct-folder mappings and scan evidence

The generic Folder mappings table now obtains the completed-setup direct-child
projection and filters those paths before rendering automatic storage mappings.
The Games tab remains the sole administrative source for every direct child and
therefore shows durable Windows or Do not scan status without a contradictory
automatic mapping.

An isolated job-labelled r6 stack used three read-only synthetic children. A was
assigned Windows, B and C were excluded, and the authenticated quick scan
completed. B was promoted through the Games tab, saved and reloaded, and the
follow-up authenticated quick scan completed. The temporary catalog persisted
one ROM from A and one from B; C had no ROM and remained visibly excluded.

The observed direct-fetch failure was concrete: a request without the existing
CSRF header returned 403. With the browser's normal CSRF header, both scan
submissions returned 202 and completed. The test stack also required its own
frontend dependency mount, which was repaired only inside that disposable
stack. No permanent or reserved UAT resources were changed and no tests were
run.

Desktop and mobile browser screenshots are in the job evidence directory.
The browser console's login-bootstrap 401s occurred before authentication and
were excluded from the authenticated flow assessment. The gallery page did not
render the two newly persisted anonymous fixture names, so catalog persistence
was confirmed from the same scan instance's read-only ROM records rather than
claiming a gallery-card visual assertion.
