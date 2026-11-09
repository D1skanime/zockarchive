"""Stable socket scan API composed from focused pipeline modules."""

from endpoints.sockets.scan_decisions import (
    _identify_firmware,
    _should_get_rom_files,
    should_scan_rom,
)
from endpoints.sockets.scan_mapping_execution import (
    execute_mapping_scan,
    execute_mapping_scans,
    execute_mixed_scans,
    mapping_scan_commands,
)
from endpoints.sockets.scan_media import (
    _emit_scanning_rom,
    _enrich_pc_dlc_from_igdb,
    _hydrate_media_urls,
    _refresh_rom_for_scan_emit,
)
from endpoints.sockets.scan_platform_execution import scan_platforms
from endpoints.sockets.scan_platform_identification import _identify_platform
from endpoints.sockets.scan_rom_identification import _identify_rom
from endpoints.sockets.scan_runtime import (
    STOP_SCAN_FLAG,
    ScanStats,
    _get_queued_scan_jobs,
    _get_running_scan_job,
    _get_socket_manager,
    _scan_job_func_names,
    _scan_platforms_func_name,
)
from endpoints.sockets.scan_socket_handlers import (
    reject_unauthorized_scan,
    scan_handler,
    stop_scan_handler,
)
from handler.scan_handler import ScanType

__all__ = [
    "STOP_SCAN_FLAG",
    "ScanStats",
    "ScanType",
    "_emit_scanning_rom",
    "_enrich_pc_dlc_from_igdb",
    "_get_queued_scan_jobs",
    "_get_running_scan_job",
    "_get_socket_manager",
    "_hydrate_media_urls",
    "_identify_firmware",
    "_identify_platform",
    "_identify_rom",
    "_refresh_rom_for_scan_emit",
    "_scan_job_func_names",
    "_scan_platforms_func_name",
    "_should_get_rom_files",
    "execute_mapping_scan",
    "execute_mapping_scans",
    "execute_mixed_scans",
    "mapping_scan_commands",
    "reject_unauthorized_scan",
    "scan_handler",
    "scan_platforms",
    "should_scan_rom",
    "stop_scan_handler",
]
