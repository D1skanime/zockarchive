import asyncio
from dataclasses import dataclass
from itertools import chain
from typing import Any, Final

import socketio  # type: ignore
from rq import Worker
from rq.job import Job, JobStatus

from config import REDIS_URL
from handler.redis_handler import (
    get_job_func_name,
    high_prio_queue,
    low_prio_queue,
    redis_client,
)
from tasks.tasks import SCAN_LIBRARY_TASK_FUNC, tasks_scheduler, update_job_meta

STOP_SCAN_FLAG: Final = "scan:stop"


def _scan_platforms_func_name() -> str:
    """Stable public RQ name for direct scan jobs from before the split."""
    return "endpoints.sockets.scan.scan_platforms"


def _scan_job_func_names() -> frozenset[str]:
    """Every job function name that ends up running a scan.

    Socket and watcher scans enqueue scan_platforms itself, while the scheduled
    rescan enqueues its own task and calls scan_platforms in process. Both have
    to be recognised or an in-flight scan goes unseen.
    """
    return frozenset(
        (
            _scan_platforms_func_name(),
            "endpoints.sockets.scan_platform_execution.scan_platforms",
            SCAN_LIBRARY_TASK_FUNC,
            "endpoints.sockets.scan.execute_mapping_scan",
            "endpoints.sockets.scan.execute_mapping_scans",
            "endpoints.sockets.scan.execute_mixed_scans",
            "endpoints.sockets.scan_mapping_execution.execute_mapping_scan",
            "endpoints.sockets.scan_mapping_execution.execute_mapping_scans",
            "endpoints.sockets.scan_mapping_execution.execute_mixed_scans",
            "handler.scan_operation_worker.run_scan_operation",
        )
    )


def _get_running_scan_job() -> Job | None:
    """The scan currently executing on a worker, if any.

    A started job is no longer in the queue, so it can only be found by asking
    the workers what they are holding.
    """
    func_names = _scan_job_func_names()
    for worker in Worker.all(connection=redis_client):
        job = worker.get_current_job()
        if job is not None and get_job_func_name(job) in func_names:
            return job

    return None


def _get_queued_scan_jobs() -> list[Job]:
    """Scans waiting to run, not yet picked up by a worker.

    Socket scans sit in the high priority queue, while watcher scans are delayed
    through the scheduler before landing in the low priority queue.
    """
    func_names = _scan_job_func_names()
    jobs: dict[str, Job] = {}

    for job in chain(high_prio_queue.get_jobs(), low_prio_queue.get_jobs()):
        if isinstance(job, Job) and get_job_func_name(job) in func_names:
            jobs[job.id] = job

    # The scheduler registry also holds the standing cron entry for the
    # scheduled rescan, which is a schedule rather than a pending scan, so only
    # delayed scan_platforms jobs count as queued here.
    for job in tasks_scheduler.get_jobs():
        if (
            isinstance(job, Job)
            and get_job_func_name(job) in (func_names - {SCAN_LIBRARY_TASK_FUNC})
            and job.get_status() in (JobStatus.SCHEDULED, JobStatus.QUEUED)
        ):
            jobs[job.id] = job

    return list(jobs.values())


@dataclass
class ScanStats:
    total_platforms: int = 0
    total_roms: int = 0
    scanned_platforms: int = 0
    new_platforms: int = 0
    identified_platforms: int = 0
    scanned_roms: int = 0
    new_roms: int = 0
    identified_roms: int = 0
    scanned_firmware: int = 0
    new_firmware: int = 0

    def __post_init__(self):
        # Lock for thread-safe updates
        self._lock = asyncio.Lock()

    async def update(self, socket_manager: socketio.AsyncRedisManager, **kwargs):
        async with self._lock:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)

            from handler.scan_operation_worker import persist_scan_stats

            payload = persist_scan_stats(self.to_dict())
            update_job_meta({"scan_stats": payload})
            await socket_manager.emit("scan:update_stats", payload)

    async def increment(self, socket_manager: socketio.AsyncRedisManager, **kwargs):
        async with self._lock:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    current_value = getattr(self, key)
                    setattr(self, key, current_value + value)

            from handler.scan_operation_worker import persist_scan_stats

            payload = persist_scan_stats(self.to_dict())
            update_job_meta({"scan_stats": payload})
            await socket_manager.emit("scan:update_stats", payload)

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_platforms": self.total_platforms,
            "total_roms": self.total_roms,
            "scanned_platforms": self.scanned_platforms,
            "new_platforms": self.new_platforms,
            "identified_platforms": self.identified_platforms,
            "scanned_roms": self.scanned_roms,
            "new_roms": self.new_roms,
            "identified_roms": self.identified_roms,
            "scanned_firmware": self.scanned_firmware,
            "new_firmware": self.new_firmware,
        }


def _get_socket_manager() -> socketio.AsyncRedisManager:
    """Connect to external socketio server"""
    from handler.scan_operation_worker import AttemptSocketManager, active_scan_worker

    manager = socketio.AsyncRedisManager(REDIS_URL, write_only=True)
    return AttemptSocketManager(manager) if active_scan_worker() else manager
