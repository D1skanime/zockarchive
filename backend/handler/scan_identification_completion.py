"""Completion fencing for post-identification scan work."""

from collections.abc import Awaitable, Callable
from contextvars import ContextVar
from functools import wraps
from typing import ParamSpec, TypeVar

from logger.logger import log
from models.rom import Rom

P = ParamSpec("P")
T = TypeVar("T")


class IdentificationCompletion:
    """Commit a persisted scan child even when optional follow-up work fails."""

    def __init__(self):
        self.rom: Rom | None = None
        self.completed = False

    def bind(self, rom: Rom) -> None:
        self.rom = rom

    def record(self, rom: Rom) -> None:
        from handler.scan_operation_checkpoint import record_completed_game

        record_completed_game(rom)
        self.completed = True

    def finalize(self, *, preserve_error: bool) -> None:
        if self.rom is None or self.completed:
            return
        try:
            self.record(self.rom)
        except Exception:
            if not preserve_error:
                raise
            log.exception("Scan completion checkpoint could not be committed")


_CURRENT: ContextVar[IdentificationCompletion | None] = ContextVar(
    "scan_identification_completion", default=None
)


def protect_identification_completion(
    function: Callable[P, Awaitable[T]],
) -> Callable[P, Awaitable[T]]:
    """Keep a post-scan exception from bypassing selected-child retirement."""

    @wraps(function)
    async def guarded(*args: P.args, **kwargs: P.kwargs) -> T:
        completion = IdentificationCompletion()
        token = _CURRENT.set(completion)
        try:
            try:
                return await function(*args, **kwargs)
            except BaseException:
                completion.finalize(preserve_error=True)
                raise
            else:
                completion.finalize(preserve_error=False)
        finally:
            _CURRENT.reset(token)

    return guarded


def bind_identification_completion(rom: Rom) -> None:
    completion = _CURRENT.get()
    if completion is not None:
        completion.bind(rom)


def record_identification_completion(rom: Rom) -> None:
    completion = _CURRENT.get()
    if completion is None:
        from handler.scan_operation_checkpoint import record_completed_game

        record_completed_game(rom)
        return
    completion.record(rom)
