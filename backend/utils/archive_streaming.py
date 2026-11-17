"""Bounded subprocess-pipe streaming for archive extractors."""

import os
import select
import subprocess
from collections.abc import Callable, Iterator
from typing import IO, Any, Protocol


class ArchiveExtractor(Protocol):
    """The extractor pipe required by the bounded stream reader."""

    stdout: IO[Any] | None


def stream_process_stdout_until_idle(
    process: ArchiveExtractor,
    idle_seconds: float,
    on_timeout: Callable[[], None],
    *,
    chunk_size: int,
) -> Iterator[bytes]:
    """Yield extractor output without allowing an idle pipe past ``idle_seconds``.

    Every delivered chunk renews the idle allowance, so a large but continuously
    streaming archive is not treated as stalled. The caller reaps its exact
    child from the timeout callback before reporting the archive read failure.
    """
    assert process.stdout is not None
    output_fd = process.stdout.fileno()
    if not isinstance(output_fd, int):
        while chunk := process.stdout.read(chunk_size):
            yield chunk
        return
    while True:
        readable, _, _ = select.select([output_fd], [], [], idle_seconds)
        if not readable:
            on_timeout()
            return
        chunk = os.read(output_fd, chunk_size)
        if not chunk:
            return
        yield chunk


def stream_extractor_until_idle(process, idle_seconds, on_timeout, *, chunk_size):
    """Reap a stalled extractor before handing its timeout to the caller."""

    def reap():
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        on_timeout()

    yield from stream_process_stdout_until_idle(
        process, idle_seconds, reap, chunk_size=chunk_size
    )
