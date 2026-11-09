"""Safe, attempt-scoped projections for durable scan-operation snapshots."""

from datetime import timezone

from sqlalchemy import case, func, or_, select

from endpoints.responses.scan_operations import (
    ScanOperationPlatform,
    ScanOperationResultQuery,
    ScanOperationSnapshot,
    ScanOperationTotals,
)
from models.platform import Platform
from models.scan_operation import ScanOperationItem
from models.storage import PlatformStorageMapping


def _classification(item):
    inventory = item.checkpoint.get("inventory_status", {})
    provider = item.checkpoint.get("provider_observation", {})
    if inventory.get("identified_windows") is False:
        return "unidentified"
    if item.outcome == "failed" or provider.get("outcome") == "failed":
        return "failed"
    if item.outcome == "warning":
        return "warning"
    return item.outcome


def _unidentified_predicate(item):
    """Match only the durable JSON boolean false, never an absent fact."""
    inventory = item.checkpoint["inventory_status"]
    return inventory["identified_windows"].as_string() == "false"


def _classification_predicate(item, outcome):
    provider = item.checkpoint["provider_observation"]
    unidentified = _unidentified_predicate(item)
    failed = or_(item.outcome == "failed", provider["outcome"].as_string() == "failed")
    warning = item.outcome == "warning"
    predicates = {
        "unidentified": unidentified,
        "failed": failed,
        "warning": warning,
        "completed": item.outcome == "completed",
        "indexed": item.outcome == "indexed",
        "skipped": item.outcome == "skipped",
    }
    if outcome == "all":
        return None
    if outcome == "action-required":
        return or_(unidentified, failed, warning)
    return predicates[outcome]


def _attempt_predicate(row):
    item = ScanOperationItem
    return [item.operation_id == row.id, item.attempt_id == row.attempt_id]


def _completed_attempt_visibility(row, item):
    """Keep canonical games plus actionable provider diagnostics in final views."""
    if row.checkpoint.get("game_results_complete"):
        return or_(item.provider == "", item.outcome.in_(("warning", "failed")))
    return None


def _current_attempt_predicate(row, query):
    conditions = _attempt_predicate(row)
    item = ScanOperationItem
    visibility = _completed_attempt_visibility(row, item)
    if visibility is not None:
        conditions.append(visibility)
    if query.search:
        conditions.append(func.lower(item.relative_path).contains(query.search))
    if query.platform_id is not None:
        conditions.append(PlatformStorageMapping.platform_id == query.platform_id)
    outcome = _classification_predicate(item, query.outcome)
    if outcome is not None:
        conditions.append(outcome)
    return conditions


def _item_result(item, platform):
    from handler.scan_inventory_status import item_facts

    safe_platform = (
        ScanOperationPlatform(
            id=platform.id, name=platform.custom_name or platform.name
        )
        if platform is not None
        else None
    )
    return item_facts(item).model_copy(
        update={"platform": safe_platform, "result": _classification(item)}
    )


def _rows(session, row, query, *, offset=0, limit=None):
    item = ScanOperationItem
    statement = (
        select(item, Platform)
        .outerjoin(PlatformStorageMapping, PlatformStorageMapping.id == item.mapping_id)
        .outerjoin(Platform, Platform.id == PlatformStorageMapping.platform_id)
        .where(*_current_attempt_predicate(row, query))
        .order_by(item.id)
        .offset(offset)
    )
    if limit is not None:
        statement = statement.limit(limit)
    return session.execute(statement).all()


def _totals(session, row):
    item = ScanOperationItem
    visibility = _completed_attempt_visibility(row, item)
    provider = item.checkpoint["provider_observation"]
    unidentified = _unidentified_predicate(item)
    failed = or_(item.outcome == "failed", provider["outcome"].as_string() == "failed")
    warning = item.outcome == "warning"
    values = session.execute(
        select(
            func.count(),
            *[
                func.sum(case((condition, 1), else_=0))
                for condition in (
                    item.outcome == "indexed",
                    item.outcome == "completed",
                    warning,
                    failed,
                    item.outcome == "skipped",
                    unidentified,
                    or_(unidentified, failed, warning),
                )
            ],
        ).where(
            item.operation_id == row.id,
            item.attempt_id == row.attempt_id,
            *([visibility] if visibility is not None else []),
        )
    ).one()
    return ScanOperationTotals(
        total=int(values[0] or 0),
        indexed=int(values[1] or 0),
        completed=int(values[2] or 0),
        warning=int(values[3] or 0),
        failed=int(values[4] or 0),
        skipped=int(values[5] or 0),
        unidentified=int(values[6] or 0),
        action_required=int(values[7] or 0),
    )


def _platforms(session, row):
    item = ScanOperationItem
    visibility = _completed_attempt_visibility(row, item)
    statement = (
        select(Platform.id, Platform.name, Platform.custom_name)
        .join(PlatformStorageMapping, PlatformStorageMapping.platform_id == Platform.id)
        .join(item, item.mapping_id == PlatformStorageMapping.id)
        .where(
            *_attempt_predicate(row),
            *([visibility] if visibility is not None else []),
        )
        .distinct()
        .order_by(
            func.lower(func.coalesce(Platform.custom_name, Platform.name)), Platform.id
        )
    )
    return [
        ScanOperationPlatform(id=platform_id, name=custom_name or name)
        for platform_id, name, custom_name in session.execute(statement)
    ]


def _active_platform(row):
    active = row.checkpoint.get("active_platform")
    if row.state != "running" or not isinstance(active, dict):
        return None
    if active.get("attempt_id") != row.attempt_id:
        return None
    try:
        return ScanOperationPlatform(id=active["id"], name=active["name"])
    except (KeyError, TypeError, ValueError):
        return None


def operation_snapshot(session, row, *, query=None):
    """Return one filtered current-attempt page or a compact row-free snapshot."""
    query = query or ScanOperationResultQuery()
    if not isinstance(query, ScanOperationResultQuery):
        query = ScanOperationResultQuery.model_validate(query)
    totals = _totals(session, row)
    actionable_query = ScanOperationResultQuery(outcome="action-required")
    actionable_rows = _rows(session, row, actionable_query, limit=3)
    total = session.scalar(
        select(func.count())
        .select_from(ScanOperationItem)
        .outerjoin(
            PlatformStorageMapping,
            PlatformStorageMapping.id == ScanOperationItem.mapping_id,
        )
        .where(*_current_attempt_predicate(row, query))
    )
    page_rows = (
        _rows(session, row, query, offset=query.offset, limit=query.limit)
        if query.include_items
        else []
    )
    from handler.scan_inventory_status import inventory_counts

    return ScanOperationSnapshot(
        id=row.id,
        request_key=row.request_key,
        job_id=row.rq_job_id,
        attempt_id=row.attempt_id,
        version=row.version,
        state=row.state,
        scan_stats={
            key: value
            for key, value in row.scan_stats.items()
            if key
            not in {
                "inventory_checked",
                "inventory_unchanged",
                "inventory_changed",
                "inventory_refresh_required",
                "inventory_incomplete",
                "unresolved_games",
                "metadata_retry_games",
                "provider_requests",
                "metadata_cache_hits",
            }
        }
        | inventory_counts(session, row),
        cause_code=row.cause_code,
        next_action=row.next_action,
        intentional_cancel=row.intentional_cancel,
        dispatch_pending=row.dispatch_due is not None,
        items=[_item_result(item, platform) for item, platform in page_rows],
        items_offset=query.offset if query.include_items else 0,
        items_total=int(total or 0),
        query=query,
        totals=totals,
        platforms=_platforms(session, row),
        actionable_count=totals.action_required,
        actionable_samples=[
            _item_result(item, platform) for item, platform in actionable_rows
        ],
        active_platform=_active_platform(row),
        created_at=row.created_at.replace(tzinfo=timezone.utc),
        updated_at=row.updated_at.replace(tzinfo=timezone.utc),
    )


def with_queue_projection(snapshot):
    if snapshot.dispatch_pending or snapshot.state in {"accepted", "recovering"}:
        return snapshot
    from redis.exceptions import RedisError
    from rq.exceptions import NoSuchJobError
    from rq.job import Job

    from endpoints.tasks import _build_task_status_response
    from handler.redis_handler import redis_client

    status = None
    try:
        job = Job.fetch(snapshot.job_id, connection=redis_client)
        task = _build_task_status_response(job)
        status = getattr(task["status"], "value", task["status"])
        condition = "available"
    except NoSuchJobError:
        condition = "expired"
    except RedisError:
        condition = "unavailable"
    return snapshot.model_copy(
        update={"queue_condition": condition, "queue_status": status}
    )
