from types import SimpleNamespace
from typing import cast
from unittest.mock import Mock

from handler import scan_mapping_identity_recovery as recovery
from models.rom import Rom


def test_rebinds_exact_missing_mapping_identity(monkeypatch):
    rom = cast(Rom, SimpleNamespace(id=43, missing_from_fs=True))
    command = SimpleNamespace(mapping_id=9, expected_revision=1)
    mapping = SimpleNamespace(relative_path="pc")
    context = Mock()
    context.validate.return_value = mapping
    updated = SimpleNamespace(id=43, missing_from_fs=False, fs_path="pc")

    monkeypatch.setattr(recovery, "current_checkpoint_command", lambda: command)
    monkeypatch.setattr(recovery, "MappingReadContext", Mock(return_value=context))
    monkeypatch.setattr(recovery, "_matches_inactive_mapping", lambda *args: True)
    update = Mock(return_value=updated)
    monkeypatch.setattr(recovery.db_rom_handler, "update_rom", update)

    assert (
        recovery.rebind_missing_mapping_identity(rom, {"logical_fs_path": "pc"})
        is updated
    )
    update.assert_called_once_with(43, {"fs_path": "pc", "missing_from_fs": False})


def test_rejects_missing_row_without_exact_mapping_identity(monkeypatch):
    rom = cast(Rom, SimpleNamespace(id=43, missing_from_fs=True))
    command = SimpleNamespace(mapping_id=9, expected_revision=1)
    context = Mock()
    context.validate.return_value = SimpleNamespace(relative_path="pc")

    monkeypatch.setattr(recovery, "current_checkpoint_command", lambda: command)
    monkeypatch.setattr(recovery, "MappingReadContext", Mock(return_value=context))
    monkeypatch.setattr(recovery, "_matches_inactive_mapping", lambda *args: False)
    update = Mock()
    monkeypatch.setattr(recovery.db_rom_handler, "update_rom", update)

    assert recovery.rebind_missing_mapping_identity(rom, {}) is None
    update.assert_not_called()


def test_mapping_recovery_marks_only_a_rebound_entry(monkeypatch):
    recovered = SimpleNamespace(id=43)
    fallback = Mock(return_value=SimpleNamespace(id=71))
    entry = {"fs_name": "Hades"}
    monkeypatch.setattr(
        recovery, "rebind_missing_mapping_identity", Mock(return_value=recovered)
    )

    result, rebound = recovery.recover_mapping_identity(
        True, None, SimpleNamespace(id=43), entry, fallback
    )

    assert result is recovered
    assert rebound is True
    assert entry["mapping_identity_rebound"] is True
    fallback.assert_not_called()


def test_mapping_recovery_keeps_existing_selected_child_fallback(monkeypatch):
    fallback_result = SimpleNamespace(id=71)
    fallback = Mock(return_value=fallback_result)
    entry = {"fs_name": "Hades"}
    monkeypatch.setattr(
        recovery, "rebind_missing_mapping_identity", Mock(return_value=None)
    )

    result, rebound = recovery.recover_mapping_identity(
        True, None, SimpleNamespace(id=43), entry, fallback
    )

    assert result is fallback_result
    assert rebound is False
    assert "mapping_identity_rebound" not in entry
    fallback.assert_called_once()
