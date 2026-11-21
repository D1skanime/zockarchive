---
quick_id: 261121-iu1
title: Recover stalled Dev scan lifecycle
status: complete
---

# Recover stalled Dev scan lifecycle

## Read-only Dev diagnosis

The active slot referenced operation `d04378bf-952f-4f48-add7-22fd88270432`.
It was `interrupted`, had no lease or dispatch claim, and remained active only
because recovery reported `worker_stop_unconfirmed`. Its RQ job was terminal
`FAILED`, had no `ended_at` after the process restart, and neither registered
worker reported that job as current. The former recovery required the missing
timestamp even after it had observed a terminal job and no worker ownership.
It therefore never advanced the operation or released its supported lifecycle
action.

The correction treats terminal RQ state plus no worker ownership as the proof
that a previous attempt cannot write. It does not release a slot directly: the
existing source checkpoint validation still runs first. The legacy interrupted
operation had no authoritative source generation, so it correctly became
`blocked/source_unverifiable`; the visible Stop action then transitioned it to
`cancelled` and released the slot through the existing lifecycle fence.

## UI correction

Scan-status restoration now asks the server for the execution slot before
using a browser-local completed operation. A `scan_already_active` response
also retrieves and displays the actual active operation. This prevents stale
local storage from replacing a blocked operation with an unrelated completed
scan and exposes the existing safe Stop/Resume actions.

## Dev browser verification

Normal form login was used without persisting credentials. At desktop width the
blocked operation displayed its 29-game count, source-verification message and
Stop action. Clicking Stop made it `Cancelled`; the next All/Quick scan
received HTTP 202, showed `Queued`, then completed. At mobile width the same
operation showed live progress (`5 of 5 games checked`) and the Stop action.

A regular metadata refresh for ROM 5500 also received HTTP 202 and completed:
the resulting durable operation scanned six ROMs and recorded seven completed
metadata items. The mobile refresh dialog opened and was cancelled without
creating a second operation.

- `screens/261121-iu1-blocked-desktop.png`
- `screens/261121-iu1-started-desktop.png`
- `screens/261121-iu1-started-mobile.png`
- `screens/261121-iu1-refresh-metadata-desktop.png`
- `screens/261121-iu1-refresh-metadata-mobile.png`

## Validation

- Scoped Trunk lint/type/security checks passed.
- Frontend typecheck passed.
- Changed backend module compiled in `pgdp-dev`.
- Production frontend build passed in `pgdp-dev`.

No NAS, production stack, library files, merge, release, or push was used.
