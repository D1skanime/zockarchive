"""Bounded source evidence, retained privately and never accepted from clients."""

import hashlib
import json
import stat
from contextlib import contextmanager
from contextvars import ContextVar
from pathlib import PurePosixPath

from handler.filesystem.storage_policy import StorageOperation
from handler.storage.read_context import MappingReadContext

_CURRENT = ContextVar("scan_checkpoint_command", default=None)


class SourceEvidenceRejected(RuntimeError):
    def __init__(self, code="source_unverifiable"):
        self.code = code
        super().__init__(code)


@contextmanager
def bind_checkpoint_command(command):
    token = _CURRENT.set(command)
    try:
        yield command
    finally:
        _CURRENT.reset(token)


def current_checkpoint_command():
    return _CURRENT.get()


def capture_file_evidence(command, relative_path):
    context = MappingReadContext(command.mapping_id, command.expected_revision)
    mapping = context.validate()
    with context.open(StorageOperation.STAT, relative_path) as capability:
        before = capability.stat()
    with context.open(StorageOperation.HASH, relative_path) as capability:
        digest = capability.hash("sha256")
    with context.open(StorageOperation.STAT, relative_path) as capability:
        after = capability.stat()

    def signature(info):
        return (
            info.st_dev,
            info.st_ino,
            info.st_size,
            info.st_mtime_ns,
            info.st_ctime_ns,
        )

    if signature(before) != signature(after):
        raise SourceEvidenceRejected("source_changed")
    return {
        "mapping_id": command.mapping_id,
        "revision": command.expected_revision,
        "root_id": mapping.storage_root_id,
        "path": relative_path,
        "sha256": digest,
        "size": after.st_size,
    }


def validate_file_evidence(command, evidence):
    if not isinstance(evidence, dict) or set(evidence) != {
        "mapping_id",
        "revision",
        "root_id",
        "path",
        "sha256",
        "size",
    }:
        raise SourceEvidenceRejected()
    actual = capture_file_evidence(command, evidence["path"])
    if actual != evidence:
        raise SourceEvidenceRejected("source_changed")
    return True


def validate_recovery_checkpoint(execution, *, generation_validator=None):
    checkpoint = execution["checkpoint"]
    # Individual committed file hashes cannot prove unchanged unfinished scope.
    # Automatic continuation requires an authoritative immutable source generation.
    if checkpoint.get("schema") != 1 or not checkpoint.get("source_generation"):
        raise SourceEvidenceRejected()
    if generation_validator is None or not generation_validator(execution):
        raise SourceEvidenceRejected()
    return checkpoint


def game_file_evidence(command, rom, files):
    scope = dict(command.options).get("relative_path", "").rpartition("/")[0]
    entries = []
    if not files or len(files) > 24:
        return {"verifiable": False}
    prefix = rom.fs_path.rstrip("/") + "/"
    for file in files:
        relative = file.full_path.removeprefix(prefix)
        if relative == file.full_path or not file.sha1_hash:
            return {"verifiable": False}
        entries.append(
            {
                "path": "/".join(p for p in (scope, relative) if p),
                "sha1": file.sha1_hash,
                "size": file.file_size_bytes,
            }
        )
    evidence = {
        "schema": 1,
        "files": entries,
        "mapping_id": command.mapping_id,
        "target": "/".join(p for p in (scope, rom.fs_name) if p),
        "revision": command.expected_revision,
    }
    return evidence if len(json.dumps(evidence)) <= 7000 else {"verifiable": False}


def validate_game_evidence(command, evidence):
    if (
        evidence.get("schema") != 1
        or not evidence.get("files")
        or evidence.get("mapping_id") != command.mapping_id
        or evidence.get("revision") != command.expected_revision
    ):
        raise SourceEvidenceRejected()
    context = MappingReadContext(command.mapping_id, command.expected_revision)
    context.validate()
    target = evidence.get("target")
    if not target:
        raise SourceEvidenceRejected()
    expected_paths = {item["path"] for item in evidence["files"]}
    before_inventory = _game_inventory(context, target)
    if before_inventory != expected_paths:
        raise SourceEvidenceRejected("source_changed")
    for item in evidence["files"]:
        with context.open(StorageOperation.STAT, item["path"]) as source:
            before = source.stat()
        with context.open(StorageOperation.HASH, item["path"]) as source:
            digest = source.hash("sha1")
        with context.open(StorageOperation.STAT, item["path"]) as source:
            after = source.stat()
        if (
            (
                before.st_dev,
                before.st_ino,
                before.st_size,
                before.st_mtime_ns,
                before.st_ctime_ns,
            )
            != (
                after.st_dev,
                after.st_ino,
                after.st_size,
                after.st_mtime_ns,
                after.st_ctime_ns,
            )
            or after.st_size != item["size"]
            or digest != item["sha1"]
        ):
            raise SourceEvidenceRejected("source_changed")
    if _game_inventory(context, target) != before_inventory:
        raise SourceEvidenceRejected("source_changed")
    return True


def _game_inventory(context, target):
    pending = [target]
    files = set()
    visited = 0
    while pending:
        path = pending.pop()
        visited += 1
        if visited > 128:
            raise SourceEvidenceRejected()
        with context.open(StorageOperation.STAT, path) as source:
            metadata = source.stat()
        if stat.S_ISREG(metadata.st_mode):
            files.add(path)
        elif stat.S_ISDIR(metadata.st_mode):
            with context.open(StorageOperation.SCAN, path) as source:
                pending.extend(path + "/" + name for name in source.scan())
        else:
            raise SourceEvidenceRejected()
    return files


def record_completed_game(rom):
    command = current_checkpoint_command()
    if command is None:
        return
    from handler.scan_collection_finalize import finalize_completed_game

    finalize_completed_game(rom, command)
    record_checked_game(
        rom,
        outcome="completed",
        metadata_identified=not rom.is_unidentified,
    )


def is_selected_collection_child(rom):
    """Whether this skipped ROM is the child chosen for parent retirement.

    A quick Windows inventory may safely reuse an existing child without
    entering the normal identification path. The explicit collection choice
    still has to reach the same completion fence, otherwise its parent remains
    eligible for a later discovery scan.
    """
    from handler.database.scan_operations_handler import DBScanOperationsHandler
    from handler.database.scan_write_fence import current_scan_write_context

    command = current_checkpoint_command()
    if command is None or not is_selected_collection_scope(
        dict(command.options).get("relative_path", "")
    ):
        return False
    context = current_scan_write_context()
    if context is None:
        return False
    intent = (
        DBScanOperationsHandler()
        .execution(context.operation_id)["command"]
        .get("collection_promotion")
    )
    if intent is None:
        return False
    mapping = MappingReadContext(
        command.mapping_id, command.expected_revision
    ).validate()
    try:
        relative_path = (
            (PurePosixPath(rom.fs_path) / rom.fs_name)
            .relative_to(PurePosixPath(mapping.relative_path))
            .as_posix()
        )
    except ValueError:
        return False
    return relative_path == intent["selected_child_relative_path"]


def is_selected_collection_scope(relative_path):
    """Whether the active mapped command is an explicit child selection."""
    from handler.database.scan_operations_handler import DBScanOperationsHandler
    from handler.database.scan_write_fence import current_scan_write_context

    context = current_scan_write_context()
    command = current_checkpoint_command()
    if context is None or command is None:
        return False
    scoped_path = dict(command.options).get("relative_path")
    if not scoped_path or scoped_path != relative_path:
        return False
    intent = (
        DBScanOperationsHandler()
        .execution(context.operation_id)["command"]
        .get("collection_promotion")
    )
    return intent is not None and (
        command.mapping_id,
        command.expected_revision,
        scoped_path,
        relative_path,
    ) == (
        intent["mapping_id"],
        intent["expected_revision"],
        intent["selected_child_relative_path"],
        intent["selected_child_relative_path"],
    )


def record_checked_game(rom, *, outcome, cause_code=None, metadata_identified=None):
    """Persist one canonical result per scanned game, independent of providers."""
    from handler.database.scan_write_fence import current_scan_write_context

    context = current_scan_write_context()
    command = current_checkpoint_command()
    if context is None or command is None:
        return
    from handler.database.scan_operations_handler import DBScanOperationsHandler

    mapping = MappingReadContext(
        command.mapping_id, command.expected_revision
    ).validate()
    try:
        relative_path = (
            (PurePosixPath(rom.fs_path) / rom.fs_name)
            .relative_to(PurePosixPath(mapping.relative_path))
            .as_posix()
        )
    except ValueError:
        raise SourceEvidenceRejected("source_outside_mapping") from None
    target = f"{command.mapping_id}:{rom.id}:{relative_path}"
    DBScanOperationsHandler().record_worker_item(
        context,
        {
            "target_key": "checked-" + hashlib.sha256(target.encode()).hexdigest(),
            "mapping_id": command.mapping_id,
            "expected_revision": command.expected_revision,
            "relative_path": relative_path,
            "provider": "",
            "outcome": outcome,
            "cause_code": cause_code,
        },
        checkpoint={
            "rom_id": rom.id,
            "game_result": True,
            **(
                {"metadata_identified": metadata_identified}
                if metadata_identified is not None
                else {}
            ),
        },
    )
