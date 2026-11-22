"""Create and compare isolated evidence for a large PS3 folder download.

This development helper is deliberately limited to descendants of ``$TMPDIR``.
It creates no library records and never reads from a configured storage root.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any

FILE_COUNT = 3_072
INVENTORY_NAME = "expected-inventory.json"


def _temporary_root() -> Path:
    """Return the resolved temporary root without exposing its value."""
    return Path(os.environ.get("TMPDIR", tempfile.gettempdir())).resolve()


def _temporary_descendant(value: str) -> Path:
    """Reject paths outside the caller's temporary directory subtree."""
    candidate = Path(value).resolve()
    temporary_root = _temporary_root()
    if candidate == temporary_root or temporary_root not in candidate.parents:
        raise ValueError("fixture paths must be descendants of TMPDIR")
    return candidate


def _fixture_paths() -> Iterable[Path]:
    """Yield a deterministic PS3 layout with nested game and sibling entries."""
    yield Path("PS3_DISC.SFB")
    yield Path("PS3_GAME/PARAM.SFO")
    yield Path("PS3_GAME/ICON0.PNG")
    yield Path("PS3_GAME/LICDIR/LICENSE.DAT")
    for index in range(FILE_COUNT):
        yield Path(
            "PS3_GAME/USRDIR"
            f"/content_{index % 16:02d}"
            f"/chunk_{index // 128:02d}"
            f"/asset_{index:04d}.bin"
        )


def _content(relative_path: Path) -> bytes:
    """Make small deterministic content so expected checksums are reproducible."""
    return hashlib.sha256(relative_path.as_posix().encode("utf-8")).digest()


def _inventory_entry(relative_path: Path, content: bytes) -> dict[str, Any]:
    return {
        "destination": relative_path.as_posix(),
        "size": len(content),
        "sha256": hashlib.sha256(content).hexdigest(),
    }


def create_fixture(output_root: Path) -> int:
    """Create the synthetic tree and its expected manifest-shaped inventory."""
    if output_root.exists():
        raise ValueError("fixture output path must not already exist")

    inventory: list[dict[str, Any]] = []
    for relative_path in _fixture_paths():
        content = _content(relative_path)
        destination = output_root / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        inventory.append(_inventory_entry(relative_path, content))

    expected = {"schema_version": 1, "members": inventory}
    (output_root / INVENTORY_NAME).write_text(
        json.dumps(expected, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps({"created_members": len(inventory)}))
    return 0


def _read_members(path: Path) -> dict[str, tuple[int, str]]:
    """Read a manifest response/export without accepting source-path fields."""
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError("manifest export must be readable JSON") from error

    members = payload.get("members") if isinstance(payload, Mapping) else payload
    if not isinstance(members, list):
        raise ValueError("manifest export must contain a members list")

    result: dict[str, tuple[int, str]] = {}
    for member in members:
        if not isinstance(member, Mapping):
            raise ValueError("manifest members must be objects")
        destination = member.get("destination")
        size = member.get("size")
        sha256 = member.get("sha256")
        if (
            not isinstance(destination, str)
            or not isinstance(size, int)
            or not isinstance(sha256, str)
            or len(sha256) != 64
            or destination in result
        ):
            raise ValueError(
                "manifest members must have unique destination, size and SHA-256"
            )
        result[destination] = (size, sha256)
    return result


def compare_fixture(output_root: Path, manifest_export: Path) -> int:
    """Compare a temporary manifest export and print aggregate evidence only."""
    expected = _read_members(output_root / INVENTORY_NAME)
    actual = _read_members(manifest_export)
    expected_destinations = set(expected)
    actual_destinations = set(actual)
    shared_destinations = expected_destinations & actual_destinations
    checksum_mismatches = sum(
        expected[destination][1] != actual[destination][1]
        for destination in shared_destinations
    )
    size_mismatches = sum(
        expected[destination][0] != actual[destination][0]
        for destination in shared_destinations
    )
    summary = {
        "actual_members": len(actual),
        "checksum_mismatches": checksum_mismatches,
        "expected_members": len(expected),
        "extra_paths": len(actual_destinations - expected_destinations),
        "missing_paths": len(expected_destinations - actual_destinations),
        "size_mismatches": size_mismatches,
    }
    print(json.dumps(summary, sort_keys=True))
    return (
        0
        if not any(summary[key] for key in summary if key != "expected_members")
        else 1
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("create", help="create a temporary PS3 fixture")
    create.add_argument("output_root")
    compare = commands.add_parser("compare", help="compare a temporary manifest export")
    compare.add_argument("output_root")
    compare.add_argument("manifest_export")
    args = parser.parse_args()

    try:
        output_root = _temporary_descendant(args.output_root)
        if args.command == "create":
            return create_fixture(output_root)
        manifest_export = _temporary_descendant(args.manifest_export)
        return compare_fixture(output_root, manifest_export)
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
