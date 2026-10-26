"""Fail-closed cleanup ownership and anonymous-volume proof for Phase 34 runs."""

import json

from phase34_fixtures import (
    cleanup_snapshot,
    redact_evidence,
    restore_generated_owner,
    source_manifest,
)
from phase34_target_guard import LABEL


def owned(run, kind):
    result = run.command(
        [
            "docker",
            kind,
            "ls",
            "-q",
            "--filter",
            "label=com.docker.compose.project=" + run.project,
        ]
    )
    identities = result.stdout.split()
    for identity in identities:
        item = run.inspect(kind, identity)
        labels = (
            item.get("Config", {}).get("Labels")
            if kind == "container"
            else item.get("Labels")
        )
        if not labels or labels.get(LABEL) != run.token:
            raise RuntimeError("cleanup refused: ownership mismatch for " + kind)
    return identities


def container_volumes(run, containers):
    """Return volume names mounted by containers already verified for this run."""
    volumes = []
    for identity in containers:
        item = run.inspect("container", identity)
        labels = item.get("Config", {}).get("Labels", {})
        if (
            labels.get(LABEL) != run.token
            or labels.get("com.docker.compose.project") != run.project
        ):
            raise RuntimeError("cleanup refused: mounted volume owner mismatch")
        for mount in item.get("Mounts", []):
            if not isinstance(mount, dict):
                raise RuntimeError("cleanup refused: invalid container mount")
            if mount.get("Type") != "volume":
                continue
            name = mount.get("Name")
            if not isinstance(name, str) or not name:
                raise RuntimeError("cleanup refused: invalid mounted volume")
            volumes.append(name)
    return sorted(set(volumes))


def remaining_volumes(run, volumes):
    """Prove that every volume observed on a verified container is gone."""
    remaining = []
    for identity in volumes:
        result = run.command(["docker", "volume", "inspect", identity], check=False)
        if result.returncode == 0:
            remaining.append(identity)
        elif result.returncode != 1:
            raise RuntimeError("cleanup refused: volume inspection failed")
    return remaining


def close_run(run):
    after = source_manifest(run.root / "Games") if run.before is not None else None
    (run.evidence / "source-after.json").write_text(json.dumps(after, indent=2))
    # Enumerate first. Any ownership mismatch stops all deletion.
    resources = {kind: run.owned(kind) for kind in ("container", "volume", "network")}
    resources["volume"] = sorted(
        set(resources["volume"]) | set(run.container_volumes(resources["container"]))
    )
    restore_generated_owner(run, resources)
    # Compose scopes anonymous image volumes to this verified disposable project.
    run.compose("down", "--volumes")
    remaining = {kind: run.owned(kind) for kind in resources}
    remaining["volume"] = sorted(
        set(remaining["volume"]) | set(run.remaining_volumes(resources["volume"]))
    )
    clean = not any(remaining.values())
    (run.evidence / "cleanup.json").write_text(
        json.dumps(
            {
                "exact_resources": resources,
                "remaining": remaining,
                "clean": clean,
                "project_volumes_removed": not remaining["volume"],
                "snapshot_removed": False,
                "source_unchanged": run.before == after,
            },
            indent=2,
        )
    )
    if not clean or run.before != after:
        raise RuntimeError("cleanup or source immutability gate failed")
    redact_evidence(run.evidence, run.token)
    cleanup_snapshot(run.root, run.project)
    cleanup_path = run.evidence / "cleanup.json"
    cleanup = json.loads(cleanup_path.read_text())
    cleanup["snapshot_removed"] = not (run.root / "checkout").exists()
    cleanup_path.write_text(json.dumps(cleanup, indent=2))
    print("PASS cleanup and source immutability", flush=True)
