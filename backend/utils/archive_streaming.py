"""Bounded subprocess-pipe streaming for archive extractors."""

import os
import select
import time
from collections.abc import Callable, Iterator
from typing import IO, Any, Protocol


class ArchiveExtractor(Protocol):
    """The extractor pipe required by the bounded stream reader."""

    stdout: IO[Any] | None


def stream_process_stdout_until_deadline(
    process: ArchiveExtractor,
    deadline: float,
    on_timeout: Callable[[], None],
    *,
    chunk_size: int,
) -> Iterator[bytes]:
    """Yield extractor output without allowing an idle pipe past ``deadline``.

    The caller owns the single archive deadline and reaps its exact child from
    the timeout callback before reporting the archive read failure.
    """
    assert process.stdout is not None
    output_fd = process.stdout.fileno()
    if not isinstance(output_fd, int):
        while chunk := process.stdout.read(chunk_size):
            if time.monotonic() >= deadline:
                on_timeout()
                return
            yield chunk
        return
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            on_timeout()
            return

        readable, _, _ = select.select([output_fd], [], [], remaining)
        if not readable:
            continue
        chunk = os.read(output_fd, chunk_size)
        if not chunk:
            return
        yield chunk
