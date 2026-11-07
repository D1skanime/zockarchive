"""Item-result recording isolated from scan-operation lifecycle transitions."""

import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from decorators.database import begin_session
from endpoints.responses.scan_operations import ScanOperationItemResult
from handler.database.scan_operation_persistence import (
    OperationConflict,
    _alive,
    _cas,
    _row,
    _slot,
)
from handler.filesystem.storage_resolver import normalize_relative_path
from handler.scan_operation_projection import operation_snapshot
from models.scan_operation import ScanOperationItem


class ScanOperationResultRecording:
    @begin_session
    def record_item(self, identity, version, attempt_id, item, *, checkpoint=None, source_evidence=None, _advance_version=True, session: Session = None):  # type: ignore
        _slot(session)
        row = _row(session, identity)
        if row.state != "running" or not _alive(row.lease_expires_at):
            raise OperationConflict("stale_attempt")
        from handler.scan_inventory_status import provider_facts

        provider_facts((checkpoint or {}).get("provider_observation"))
        validated = ScanOperationItemResult(id=1, attempt_id=attempt_id, **item)
        path = normalize_relative_path(validated.relative_path)
        matches = [
            c
            for c in row.command["commands"]
            if c["mapping_id"] == validated.mapping_id
            and c["expected_revision"] == validated.expected_revision
        ]
        if not matches or not any(
            not dict(c.get("options", [])).get("relative_path")
            or path == dict(c["options"])["relative_path"]
            or path.startswith(dict(c["options"])["relative_path"] + "/")
            for c in matches
        ):
            raise OperationConflict("item_outside_scan_scope")
        providers = row.command.get("policies", row.command.get("request", {})).get(
            "apis", []
        )
        if validated.provider not in providers:
            raise OperationConflict("provider_outside_scan_scope")
        if (
            len(json.dumps(checkpoint or {})) > 8192
            or len(json.dumps(source_evidence or {})) > 8192
        ):
            raise ValueError("item_evidence_too_large")
        if _advance_version:
            _cas(session, row, version, attempt_id)
        else:
            if row.version != version or row.attempt_id != attempt_id:
                raise OperationConflict("stale_operation")
            from handler.database.scan_operation_lifecycle import observe_execution

            observe_execution(session, row, {})
        result = session.scalar(
            select(ScanOperationItem).where(
                ScanOperationItem.operation_id == identity,
                ScanOperationItem.target_key == validated.target_key,
                ScanOperationItem.provider == validated.provider,
            )
        )
        values = validated.model_dump(
            exclude={"id", "inventory", "provider_execution"}
        ) | {
            "checkpoint": checkpoint or {},
            "source_evidence": source_evidence or {},
        }
        if result is None:
            session.add(ScanOperationItem(operation_id=identity, **values))
        else:
            for key, value in values.items():
                setattr(result, key, value)
        session.flush()
        return operation_snapshot(session, row)
