"""One SQL transaction owns acceptance, dispatch intent and the execution fence."""

from datetime import timedelta
from uuid import uuid4

from pydantic import TypeAdapter
from sqlalchemy import select
from sqlalchemy.orm import Session

from decorators.database import begin_session
from endpoints.responses.scan_operations import (
    RequestKey,
)
from handler.database.base_handler import DBBaseHandler
from handler.database.scan_operation_lifecycle import ScanOperationLifecycle
from handler.database.scan_operation_persistence import (
    OperationConflict,
    OperationNotFound,
    _alive,
    _cas,
    _release,
    _row,
    _slot,
    payload_digest,
    utc_now,
    validate_transition,
)
from handler.database.scan_operation_result_handler import ScanOperationResultRecording
from handler.filesystem.storage_resolver import normalize_relative_path
from handler.metadata.metadata_locale import (
    capture_metadata_locale,
    ensure_metadata_locale,
)
from handler.scan_command import MappedScanCommand, ScanScope, ScanTrigger
from handler.scan_operation_projection import operation_snapshot
from handler.scan_operation_state import TERMINAL
from models.scan_operation import ScanExecutionSlot, ScanOperation, ScanOperationItem


class DBScanOperationsHandler(
    ScanOperationResultRecording, ScanOperationLifecycle, DBBaseHandler
):
    @begin_session
    def replay(self, actor, request_key, digest, *, session: Session = None):  # type: ignore
        _slot(session)
        row = session.scalar(
            select(ScanOperation)
            .where(
                ScanOperation.actor_id == actor,
                ScanOperation.request_key == request_key,
            )
            .with_for_update()
        )
        if row is None:
            return None
        if row.payload_digest != digest:
            raise OperationConflict("request_payload_conflict")
        return operation_snapshot(session, row)

    @begin_session
    def accept(self, actor, request_key, normalized_commands, digest=None, *, session: Session = None):  # type: ignore
        TypeAdapter(RequestKey).validate_python(request_key)
        calculated = payload_digest(
            normalized_commands.get("request", normalized_commands)
        )
        if digest is not None and digest != calculated:
            raise ValueError("invalid_payload_digest")
        slot = _slot(session)
        existing = self.replay(actor, request_key, calculated, session=session)
        if existing is not None:
            return existing
        if slot.active_operation_id is not None:
            raise OperationConflict("scan_already_active")
        commands = normalized_commands.get("commands", [])
        if not commands or len(commands) > 256:
            raise ValueError("missing_scan_scope")
        for data in commands:
            command = MappedScanCommand(
                **(
                    data
                    | {
                        "trigger": ScanTrigger(data["trigger"]),
                        "scope": ScanScope(data["scope"]),
                        "options": tuple(tuple(v) for v in data.get("options", [])),
                    }
                )
            )
            for key, value in command.options:
                if key == "relative_path":
                    normalize_relative_path(value)
        identity = str(uuid4())
        row = ScanOperation(
            id=identity,
            actor_id=actor,
            request_key=request_key,
            payload_digest=calculated,
            command=capture_metadata_locale(normalized_commands),
            rq_job_id="scan-" + identity,
            dispatch_due=utc_now(),
        )
        session.add(row)
        session.flush()
        slot.active_operation_id = row.id
        slot.version += 1
        return operation_snapshot(session, row)

    @begin_session
    def get_by_request_key(self, actor, request_key, *, session: Session = None):  # type: ignore
        row = session.scalar(
            select(ScanOperation).where(
                ScanOperation.actor_id == actor,
                ScanOperation.request_key == request_key,
            )
        )
        if row is None:
            raise OperationNotFound("operation_not_found")
        return operation_snapshot(session, row)

    @begin_session
    def get_by_id(self, identity, actor, *, admin=False, query=None, session: Session = None):  # type: ignore
        row = session.get(ScanOperation, identity)
        if row is None or (row.actor_id != actor and not admin):
            raise OperationNotFound("operation_not_found")
        return operation_snapshot(session, row, query=query)

    @begin_session
    def find_active(self, actor, *, admin=False, session: Session = None):  # type: ignore
        row = session.scalar(
            select(ScanOperation).join(
                ScanExecutionSlot,
                ScanExecutionSlot.active_operation_id == ScanOperation.id,
            )
        )
        return (
            operation_snapshot(session, row)
            if row is not None and (admin or row.actor_id == actor)
            else None
        )

    @begin_session
    def claim_dispatch(self, identity, version, owner, *, seconds=30, session: Session = None):  # type: ignore
        _slot(session)
        row = _row(session, identity)
        if (
            row.state not in {"accepted", "recovering"}
            or row.dispatch_due is None
            or row.dispatch_due > utc_now()
            or _alive(row.dispatch_claim_until)
        ):
            raise OperationConflict("dispatch_not_claimable")
        if not owner or len(owner) > 64 or not 1 <= seconds <= 300:
            raise ValueError("invalid_dispatch_claim")
        _cas(
            session,
            row,
            version,
            dispatch_owner=owner,
            dispatch_claim_until=utc_now() + timedelta(seconds=seconds),
        )
        return operation_snapshot(session, row)

    @begin_session
    def mark_enqueued(self, identity, version, owner, *, session: Session = None):  # type: ignore
        _slot(session)
        row = _row(session, identity)
        if (
            row.dispatch_owner != owner
            or not _alive(row.dispatch_claim_until)
            or row.state not in {"accepted", "recovering"}
        ):
            raise OperationConflict("stale_dispatch")
        _cas(
            session,
            row,
            version,
            state="queued",
            cause_code=None,
            next_action=None,
            dispatch_due=None,
            dispatch_owner=None,
            dispatch_claim_until=None,
        )
        return operation_snapshot(session, row)

    @begin_session
    def claim_attempt(self, identity, version, owner, *, seconds=60, session: Session = None):  # type: ignore
        slot = _slot(session)
        row = _row(session, identity)
        if (
            slot.active_operation_id != identity
            or (
                row.state != "queued"
                and not (
                    row.state in {"accepted", "recovering"}
                    and _alive(row.dispatch_claim_until)
                )
            )
            or _alive(row.lease_expires_at)
        ):
            raise OperationConflict("attempt_not_claimable")
        if not owner or len(owner) > 64 or not 1 <= seconds <= 300:
            raise ValueError("invalid_lease")
        _cas(
            session,
            row,
            version,
            state="running",
            command=ensure_metadata_locale(row.command),
            attempt_id=row.attempt_id or str(uuid4()),
            lease_owner=owner,
            lease_expires_at=utc_now() + timedelta(seconds=seconds),
            dispatch_due=None,
            dispatch_owner=None,
            dispatch_claim_until=None,
            cause_code=None,
            next_action=None,
            checkpoint={
                key: value
                for key, value in row.checkpoint.items()
                if key
                not in {
                    "active_platform",
                    "previous_rq_job_id",
                    "previous_never_started",
                    "stopped_job_id",
                }
            },
        )
        return operation_snapshot(session, row)

    @begin_session
    def renew_lease(self, identity, version, attempt_id, owner, *, seconds=60, session: Session = None):  # type: ignore
        _slot(session)
        row = _row(session, identity)
        if (
            row.state != "running"
            or row.lease_owner != owner
            or not _alive(row.lease_expires_at)
            or not 1 <= seconds <= 300
        ):
            raise OperationConflict("stale_lease")
        _cas(
            session,
            row,
            version,
            attempt_id,
            lease_expires_at=utc_now() + timedelta(seconds=seconds),
        )
        return operation_snapshot(session, row)

    @begin_session
    def transition(self, identity, version, attempt_id, state, *, scan_stats=None, cause_code=None, next_action=None, session: Session = None):  # type: ignore
        slot = _slot(session)
        row = _row(session, identity)
        if (
            row.state == "running"
            and not _alive(row.lease_expires_at)
            and state not in {"interrupted", "blocked", "failed", "stopping"}
        ):
            raise OperationConflict("stale_lease")
        validate_transition(
            row.state, state, lease=_alive(row.lease_expires_at), confirmed_stop=False
        )
        changes = dict(state=state, cause_code=cause_code, next_action=next_action)
        if scan_stats is not None:
            changes["scan_stats"] = scan_stats
        if state in TERMINAL or state in {"blocked", "interrupted"}:
            changes.update(
                checkpoint={
                    key: value
                    for key, value in row.checkpoint.items()
                    if key != "active_platform"
                },
                lease_owner=None,
                lease_expires_at=None,
                dispatch_due=None,
                dispatch_owner=None,
                dispatch_claim_until=None,
            )
        _cas(session, row, version, attempt_id, **changes)
        _release(slot, row)
        return operation_snapshot(session, row)

    @begin_session
    def request_cancel(self, identity, actor, version, request_key, *, admin=False, session: Session = None):  # type: ignore
        _slot(session)
        row = _row(session, identity, actor=actor, admin=admin)
        TypeAdapter(RequestKey).validate_python(request_key)
        key = "cancel:" + request_key
        if len(row.mutation_keys) >= 128 and key not in row.mutation_keys:
            raise OperationConflict("mutation_history_full")
        if key in row.mutation_keys or row.state == "cancelled":
            return operation_snapshot(session, row)
        validate_transition(
            row.state,
            "stopping",
            lease=_alive(row.lease_expires_at),
            confirmed_stop=False,
        )
        _cas(
            session,
            row,
            version,
            state="stopping",
            intentional_cancel=True,
            dispatch_due=None,
            checkpoint={
                key: value
                for key, value in row.checkpoint.items()
                if key != "active_platform"
            },
            mutation_keys=row.mutation_keys | {key: True},
        )
        return operation_snapshot(session, row)

    @begin_session
    def confirm_stopped(self, identity, version, attempt_id, *, session: Session = None):  # type: ignore
        slot = _slot(session)
        row = _row(session, identity)
        validate_transition(row.state, "cancelled", lease=False, confirmed_stop=True)
        _cas(
            session,
            row,
            version,
            attempt_id,
            state="cancelled",
            checkpoint={
                key: value
                for key, value in row.checkpoint.items()
                if key != "active_platform"
            },
            lease_owner=None,
            lease_expires_at=None,
            dispatch_due=None,
            dispatch_owner=None,
            dispatch_claim_until=None,
        )
        _release(slot, row)
        return operation_snapshot(session, row)

    @begin_session
    def request_resume(self, identity, actor, version, request_key, *, admin=False, item_ids=None, session: Session = None):  # type: ignore
        slot = _slot(session)
        row = _row(session, identity, actor=actor, admin=admin)
        TypeAdapter(RequestKey).validate_python(request_key)
        key, signature = "resume:" + request_key, payload_digest(sorted(item_ids or []))
        if key in row.mutation_keys:
            if row.mutation_keys[key] != signature:
                raise OperationConflict("resume_payload_conflict")
            return operation_snapshot(session, row)
        if (
            row.state
            not in {
                "cancelled",
                "interrupted",
                "blocked",
                "failed",
                "completed-with-warnings",
            }
            or _alive(row.lease_expires_at)
            or _alive(row.dispatch_claim_until)
            or slot.active_operation_id not in {None, identity}
        ):
            raise OperationConflict("execution_not_fenced")
        if len(row.mutation_keys) >= 128:
            raise OperationConflict("mutation_history_full")
        if item_ids:
            items = list(
                session.scalars(
                    select(ScanOperationItem).where(
                        ScanOperationItem.operation_id == identity,
                        ScanOperationItem.id.in_(item_ids),
                        ScanOperationItem.outcome.in_(["failed", "warning"]),
                    )
                )
            )
            if len(items) != len(set(item_ids)) or len(item_ids) > 100:
                raise OperationConflict("invalid_metadata_retry_scope")
        else:
            items = []
        validate_transition(
            row.state,
            "recovering",
            lease=False,
            confirmed_stop=True,
            explicit_resume=True,
        )
        _cas(
            session,
            row,
            version,
            state="recovering",
            attempt_id=str(uuid4()),
            rq_job_id="scan-" + identity + "-" + str(uuid4()),
            intentional_cancel=False,
            lease_owner=None,
            lease_expires_at=None,
            dispatch_due=None,
            cause_code="source_verification_required",
            next_action="verify_source",
            mutation_keys=row.mutation_keys | {key: signature},
            checkpoint={
                key: value
                for key, value in row.checkpoint.items()
                if key != "active_platform"
            }
            | {
                "retry_item_ids": ",".join(str(i.id) for i in items),
                "previous_rq_job_id": row.rq_job_id,
                "previous_never_started": row.attempt_id is None,
            },
        )
        slot.active_operation_id = identity
        slot.version += 1
        return operation_snapshot(session, row)
