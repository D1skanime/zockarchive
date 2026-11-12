"""Read-only setup reconciliation using persisted mappings and the shared resolver."""

from dataclasses import asdict
from time import sleep

from sqlalchemy import select
from sqlalchemy.orm import Session

from config import LIBRARY_BASE_PATH
from decorators.database import begin_session
from endpoints.responses.setup import (
    SetupFolderMappingSchema,
    SetupFolderSchema,
    SetupRecoverySnapshot,
    SetupRootHealthSchema,
)
from exceptions.storage_exceptions import (
    OwnedWriterBusyError,
    StorageResolutionError,
)
from handler.database import db_storage_handler, db_user_handler
from handler.filesystem.storage_resolver import (
    get_storage_root_health_snapshot,
    normalize_relative_path,
    resolve_directory,
)
from handler.setup_folder_handler import ROOT_LABEL, setup_folder_handler
from models.platform import Platform
from models.setup_folder_exclusion import SetupFolderExclusion
from models.storage import (
    EXTERNAL_READ_ONLY_MODE,
    PlatformStorageMapping,
    StorageRoot,
)
from models.user import Role, User


class SetupRecoveryHandler:
    @staticmethod
    def root(session: Session) -> StorageRoot:
        roots = db_storage_handler.get_roots(session=session)
        candidates = [
            root
            for root in roots
            if root.name == ROOT_LABEL or root.container_path == LIBRARY_BASE_PATH
        ]
        return next((root for root in candidates if root.active), None) or next(
            iter(candidates),
            StorageRoot(
                id=0,
                name=ROOT_LABEL,
                container_path=LIBRARY_BASE_PATH,
                mode=EXTERNAL_READ_ONLY_MODE,
                active=True,
            ),
        )

    @staticmethod
    def saved(root: StorageRoot, session: Session) -> list[SetupFolderMappingSchema]:
        rows = session.execute(
            select(PlatformStorageMapping, Platform.slug)
            .join(Platform, Platform.id == PlatformStorageMapping.platform_id)
            .where(
                PlatformStorageMapping.active.is_(True),
                PlatformStorageMapping.storage_root_id == root.id,
            )
            .order_by(PlatformStorageMapping.id)
            .limit(101)
        ).all()
        result = []
        for mapping, slug in rows:
            normalize_relative_path(mapping.relative_path, allow_root=True)
            result.append(
                SetupFolderMappingSchema(
                    folder_name=mapping.relative_path,
                    disposition="platform",
                    platform_slug=slug,
                    mapping_id=mapping.id,
                    relative_path=mapping.relative_path,
                )
            )
        exclusions = session.scalars(
            select(SetupFolderExclusion)
            .where(SetupFolderExclusion.storage_root_id == root.id)
            .order_by(SetupFolderExclusion.id)
            .limit(101)
        ).all()
        for exclusion in exclusions:
            relative_path = normalize_relative_path(exclusion.relative_path)
            result.append(
                SetupFolderMappingSchema(
                    folder_name=relative_path,
                    disposition="excluded",
                    platform_slug=None,
                    mapping_id=None,
                    relative_path=relative_path,
                )
            )
        return result

    @begin_session
    def excluded_folder_paths(self, *, session: Session = None) -> set[str]:  # type: ignore
        """Return direct Games children deliberately excluded during setup.

        The scan coordinator uses this same persisted disposition authority so an
        excluded child cannot fall back into the legacy filesystem scan path.
        """
        root = self.root(session)
        return {
            normalize_relative_path(exclusion.relative_path)
            for exclusion in session.scalars(
                select(SetupFolderExclusion.relative_path).where(
                    SetupFolderExclusion.storage_root_id == root.id
                )
            )
        }

    @begin_session
    def administration_projection(self, *, session: Session = None) -> dict:  # type: ignore
        """Return completed setup's direct-folder dispositions for administrators.

        This is a read projection over the same mapping and exclusion records used
        by setup assignment. It deliberately does not expose config-file filters.
        """
        snapshot = self.snapshot(session=session)
        if not snapshot.setup_complete:
            raise ValueError("setup_assignment_conflict")
        root = self.root(session)
        discovery = setup_folder_handler.discover(root)
        saved = {row.relative_path: row for row in snapshot.saved_assignments}
        folders = []
        for folder in discovery.folders:
            disposition = saved.get(folder.relative_path)
            if disposition is None:
                raise ValueError("setup_assignment_conflict")
            folders.append(
                asdict(folder)
                | {
                    "excluded": disposition.disposition == "excluded",
                    "disposition": disposition.disposition,
                    "platform_slug": disposition.platform_slug,
                    "mapping_id": disposition.mapping_id,
                }
            )
        return {
            "root_label": ROOT_LABEL,
            "folders": folders,
            "platform_options": list(discovery.platform_options),
        }

    @begin_session
    def snapshot(self, *, session: Session = None) -> SetupRecoverySnapshot:  # type: ignore
        enrolled = bool(db_user_handler.get_admin_users(session=session))
        root = self.root(session)
        health = get_storage_root_health_snapshot(root)
        root_health = SetupRootHealthSchema(
            reachable=health.reachable,
            readable=health.readable,
            non_writable=health.non_writable,
        )
        cause = None
        saved = []
        missing = []
        if not root.active:
            cause = "root_inactive"
        elif not health.reachable:
            cause = "root_missing"
        elif not health.readable:
            cause = "root_unreadable"
        elif not health.non_writable or root.mode != EXTERNAL_READ_ONLY_MODE:
            cause = "root_not_read_only"
        try:
            saved = self.saved(root, session)
            if len(saved) > 100:
                saved = saved[:100]
                cause = cause or "mapping_conflict"
            if cause is None:
                discovery = setup_folder_handler.discover(root)
                by_path = {row.relative_path: row for row in saved}
                supported = {option["slug"] for option in discovery.platform_options}
                if len(by_path) != len(saved):
                    cause = "mapping_conflict"
                else:
                    for folder in discovery.folders:
                        mapping = by_path.get(folder.relative_path)
                        if mapping is None or (
                            mapping.disposition == "platform"
                            and mapping.platform_slug not in supported
                        ):
                            missing.append(SetupFolderSchema(**asdict(folder)))
                        elif mapping.disposition == "platform":
                            resolve_directory(root, mapping.relative_path)
                paths = {folder.relative_path for folder in discovery.folders}
                if any(row.relative_path not in paths for row in saved):
                    cause = "mapping_conflict"
                elif missing:
                    cause = "assignments_missing"
        except (ValueError, OSError, StorageResolutionError):
            cause = cause or "root_discovery_failed"
        complete = enrolled and cause is None
        action = (
            "create_admin"
            if not enrolled
            else (
                "start_first_scan"
                if complete
                else (
                    "assign_missing"
                    if cause == "assignments_missing"
                    else (
                        "resolve_conflicts"
                        if cause == "mapping_conflict"
                        else "retry_check"
                    )
                )
            )
        )
        return SetupRecoverySnapshot(
            enrolled=enrolled,
            setup_complete=complete,
            current_step=(
                "account" if not enrolled else "complete" if complete else "folders"
            ),
            saved_assignments=saved,
            missing_assignments=missing,
            root_health=root_health,
            cause_code=cause,
            next_action=action,
        )

    def assign(
        self, assignments: list[dict[str, str]], actor: dict, *, session: Session = None
    ) -> dict:  # type: ignore
        for attempt in range(3):
            try:
                return self._assign(assignments, actor, session=session)
            except OwnedWriterBusyError:
                if session is not None or attempt == 2:
                    raise
                sleep(0.01)
        raise AssertionError("unreachable setup retry")

    @begin_session
    def _assign(
        self, assignments: list[dict[str, str]], actor: dict, *, session: Session = None
    ) -> dict:  # type: ignore
        # Serialize setup retries, including first root registration, across admins.
        session.scalars(
            select(User)
            .where(User.role == Role.ADMIN)
            .order_by(User.id)
            .with_for_update()
        ).all()
        snapshot = self.snapshot(session=session)
        if snapshot.cause_code not in {None, "assignments_missing"}:
            raise ValueError(snapshot.cause_code)
        root = setup_folder_handler.root(session=session)
        saved = {
            row.folder_name: {
                "folder_name": row.folder_name,
                "disposition": row.disposition,
                "platform_slug": row.platform_slug,
            }
            for row in snapshot.saved_assignments
        }
        provided = {row["folder_name"]: row for row in assignments}
        if len(provided) != len(assignments):
            raise ValueError("setup_assignment_conflict")
        for name, assignment in provided.items():
            if (
                name in saved
                and saved[name]["disposition"] == "platform"
                and saved[name] != assignment
            ):
                raise ValueError("setup_assignment_conflict")
            # An excluded direct child has no mapping yet, so an administrator
            # may promote it through the completed-setup Games page.
            if (
                assignment["disposition"] == "excluded"
                or name not in saved
                or saved[name]["disposition"] == "excluded"
            ):
                continue
            slug = assignment["platform_slug"]
            if not isinstance(slug, str):
                raise ValueError("setup_assignment_conflict")
            platform = setup_folder_handler._resolve_platform(slug, session=session)
            mappings = db_storage_handler.list_active_mappings(
                platform.id, session=session
            )
            if not any(
                mapping.storage_root_id == root.id and mapping.relative_path == name
                for mapping in mappings
            ):
                raise ValueError("setup_assignment_conflict")
        merged = list((saved | provided).values())
        result = setup_folder_handler.assign(root, merged, actor, session=session)
        response = setup_folder_handler.response(result)
        recovery = self.snapshot(session=session)
        response.update(ready=recovery.setup_complete, recovery=recovery.model_dump())
        return response


setup_recovery_handler = SetupRecoveryHandler()
