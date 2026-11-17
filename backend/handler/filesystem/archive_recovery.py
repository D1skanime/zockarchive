"""ROM-local recovery for incomplete archive member inventories."""

from handler.scan_metadata_result import record_auxiliary_warning
from logger.logger import log


def note_incomplete_archive(game_name: str) -> None:
    """Keep the container eligible while recording the existing scan warning."""
    log.warning(
        "Archive members incomplete for game %s; using container hash", game_name
    )
    record_auxiliary_warning(
        "filesystem", game_name, "archive_member_inventory_incomplete"
    )
