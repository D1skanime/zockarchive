from typing import Any

from endpoints.sockets.activity import get_authenticated_user
from endpoints.sockets.scan_runtime import (
    STOP_SCAN_FLAG,
    _get_queued_scan_jobs,
    _get_running_scan_job,
)
from exceptions.storage_exceptions import StorageResolutionError
from handler.auth.constants import Scope
from handler.redis_handler import get_job_func_name, redis_client
from handler.socket_handler import socket_handler
from logger.logger import log
from utils import emoji


async def reject_unauthorized_scan(sid: str) -> bool:
    """Return ``True`` (and notify the caller) if the socket may not run scans.

    Scans are a privileged, destructive operation, so gate them on the same
    ``TASKS_RUN`` scope the REST task endpoints require, resolved from the
    server-side session (never from the client payload).
    """
    user = await get_authenticated_user(sid)
    if user is not None and Scope.TASKS_RUN in user.oauth_scopes:
        return False

    log.warning(f"{emoji.EMOJI_STOP_SIGN} Unauthorized scan request rejected")
    await socket_handler.socket_server.emit(
        "scan:done_ko",
        "You are not authorized to run scans",
        to=sid,
    )
    return True


@socket_handler.socket_server.on("scan")  # type: ignore
async def scan_handler(sid: str, options: dict[str, Any]):
    """Scan socket endpoint

    Args:
        options (dict): Socket options
    """

    if await reject_unauthorized_scan(sid):
        return

    from uuid import uuid4

    from endpoints.responses.scan_operations import ScanOperationRequest
    from handler.database.scan_operations_handler import (
        DBScanOperationsHandler,
        OperationConflict,
    )
    from handler.scan_operation_commands import normalize_scan_request
    from tasks.scan_operation_dispatch import dispatch_operation

    user = await get_authenticated_user(sid)
    if user is None:
        return
    try:
        body = ScanOperationRequest.model_validate(
            options
            | {"request_key": options.get("request_key") or "socket-" + str(uuid4())}
        )
        command = normalize_scan_request(body)
        accepted = DBScanOperationsHandler().accept(user.id, body.request_key, command)
        dispatch_operation(accepted.id)
        return accepted.model_dump(mode="json")
    except (ValueError, OperationConflict, StorageResolutionError):
        await socket_handler.socket_server.emit(
            "scan:done_ko", "scan_request_rejected", to=sid
        )
        return {"error": "scan_request_rejected"}


@socket_handler.socket_server.on("scan:stop")  # type: ignore
async def stop_scan_handler(sid: str):
    """Stop scan socket endpoint"""

    if await reject_unauthorized_scan(sid):
        return

    from uuid import uuid4

    from handler.database.scan_operations_handler import DBScanOperationsHandler
    from models.user import Role

    user = await get_authenticated_user(sid)
    repository = DBScanOperationsHandler()
    active = (
        repository.find_active(user.id, admin=user.role == Role.ADMIN)
        if user is not None
        else None
    )
    if active is None:
        durable_callable = "handler.scan_operation_worker.run_scan_operation"
        queued = [
            job
            for job in _get_queued_scan_jobs()
            if get_job_func_name(job) != durable_callable
        ]
        running = _get_running_scan_job()
        if running is not None and get_job_func_name(running) == durable_callable:
            running = None
        for job in queued:
            job.cancel()
        if running is not None:
            running.cancel()
            redis_client.set(STOP_SCAN_FLAG, 1)
        return None
    if user is None:
        return
    stopped = repository.request_cancel(
        active.id,
        user.id,
        active.version,
        "socket-" + str(uuid4()),
        admin=user.role == Role.ADMIN,
    )
    return stopped.model_dump(mode="json")
