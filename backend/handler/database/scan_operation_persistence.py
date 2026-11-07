"""Low-level optimistic-concurrency helpers for scan-operation persistence."""

import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import select, update

from handler.scan_operation_state import TERMINAL
from handler.scan_operation_state import validate_transition as _validate_transition
from models.scan_operation import ScanExecutionSlot, ScanOperation

_UNSET = object()


class OperationConflict(ValueError):
    pass


class OperationNotFound(LookupError):
    pass


def validate_transition(*args, **kwargs):
    try:
        _validate_transition(*args, **kwargs)
    except ValueError as error:
        raise OperationConflict(str(error)) from None


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def payload_digest(payload):
    return hashlib.sha256(
        json.dumps(
            payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True
        ).encode()
    ).hexdigest()


def _alive(expiry):
    return expiry is not None and expiry.replace(tzinfo=None) > utc_now()


def _slot(session):
    return session.scalars(
        select(ScanExecutionSlot).where(ScanExecutionSlot.id == 1).with_for_update()
    ).one()


def _row(session, identity, *, actor=None, admin=False):
    row = session.scalar(
        select(ScanOperation).where(ScanOperation.id == identity).with_for_update()
    )
    if row is None or (actor is not None and row.actor_id != actor and not admin):
        raise OperationNotFound("operation_not_found")
    return row


def _cas(session, row, version, attempt=_UNSET, **changes):
    if row.version != version or (attempt is not _UNSET and row.attempt_id != attempt):
        raise OperationConflict("stale_operation")
    statement = update(ScanOperation).where(
        ScanOperation.id == row.id, ScanOperation.version == version
    )
    if attempt is not _UNSET:
        statement = statement.where(ScanOperation.attempt_id == attempt)
    result = session.execute(
        statement.values(
            **changes, version=version + 1, updated_at=utc_now()
        ).execution_options(synchronize_session=False)
    )
    if result.rowcount != 1:
        raise OperationConflict("stale_operation")
    session.refresh(row)


def _release(slot, row):
    if slot.active_operation_id == row.id and row.state in TERMINAL:
        slot.active_operation_id = None
        slot.version += 1
