"""Validated test selection and execution for the disposable Phase 34 runner."""

import json
from pathlib import Path

from phase34_fixtures import (
    JOB_IDENTITY,
    LIFECYCLE,
    backend_command,
    expected_red,
    frontend_command,
    quality,
)


def safe_test_args(args, repo, frontend=False):
    if not args:
        raise RuntimeError("explicit test paths required (or backend --smoke)")
    paths = []
    expression = False
    base = repo / ("frontend" if frontend else "backend")
    for arg in args:
        if expression:
            if "\x00" in arg or "\n" in arg:
                raise RuntimeError("unsafe test expression")
            expression = False
            continue
        if arg in ("-k", "-m"):
            expression = True
            continue
        if arg in ("-q", "-v", "-vv", "-x", "--collect-only"):
            continue
        if arg.startswith("--maxfail=") and arg.split("=", 1)[1].isdigit():
            continue
        name = arg.split("::", 1)[0]
        target = (base / name).resolve()
        if (
            not name.startswith("src/" if frontend else "tests/")
            or "\x00" in name
            or "\n" in name
            or ".." in Path(name).parts
            or not target.is_relative_to(base)
            or not target.is_file()
        ):
            raise RuntimeError("unsafe or missing test file")
        paths.append(name)
    if not paths or expression:
        raise RuntimeError("explicit existing test files required")


def execute(mode, args, run_type, repo, red_backend, red_frontend):
    run = run_type(args.dialect if hasattr(args, "dialect") else "mariadb")
    succeeded = False
    try:
        run.start()
        if mode == "backend":
            if args.tests == ["--smoke"]:
                probe = run.root / "checkout/backend/tests/test_phase34_smoke.py"
                probe.write_text(
                    "def test_disposable_target():\n"
                    "    from config.config_manager import ConfigManager\n"
                    "    from tools.phase34_target_guard import validate_target\n"
                    "    validate_target(resolved_url=ConfigManager.get_db_engine())\n"
                )
                run.exec(backend_command(["tests/test_phase34_smoke.py", "-q"]))
            else:
                run.exec(
                    backend_command(args.tests), timeout=getattr(args, "timeout", 180)
                )
        elif mode == "frontend":
            run.exec(frontend_command(args.tests), frontend=True)
        elif mode == "schema":
            from phase34_fixtures import schema_commands

            for command in schema_commands():
                run.exec(command)
        elif mode == "reproduce":
            back = run.exec(
                backend_command([JOB_IDENTITY, "-q"], "rq-red"), check=False
            )
            front = run.exec(
                frontend_command([LIFECYCLE], "vue-red"), frontend=True, check=False
            )
            if back.returncode != 1 or front.returncode != 1:
                raise RuntimeError(
                    "RED rejected: both suites must fail assertions with exit 1"
                )
            proof = {
                "backend": expected_red(run.evidence / "rq-red.xml", red_backend),
                "frontend": expected_red(run.evidence / "vue-red.xml", red_frontend),
            }
            (run.evidence / "red-proof.json").write_text(json.dumps(proof, indent=2))
            print(json.dumps(proof), flush=True)
        elif mode == "quality":
            quality(run, args, repo)
        succeeded = True
    finally:
        try:
            run.close()
        finally:
            if (run.evidence / "cleanup.json").exists():
                from phase34_evidence import retain_run

                gate = "schema:" + run.driver if mode == "schema" else mode
                retain_run(run, gate, succeeded)
