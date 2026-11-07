import type { ZATabNavItem } from "@v2/lib";
import type {
  PcComponentSchema,
  PcComponentOwnedMediaSchema,
  RomOwnedMediaSurface,
} from "@/__generated__";

export type PcDlcCoverPresentation = {
  source: string;
};

/** Resolve the component-owned selection before considering legacy local media. */
export function resolvePcDlcCoverPresentation(
  component: PcComponentSchema,
  parentId: number,
  resourcesPath: string,
): PcDlcCoverPresentation | null {
  const activeMediaId = component.active_owned_cover_media_id;
  const activeOwnedCover =
    activeMediaId === null || activeMediaId === undefined
      ? null
      : (component.owned_media?.find(
          (media) =>
            media.id === activeMediaId &&
            media.role === "cover" &&
            media.owned_path,
        ) ?? null);

  if (activeOwnedCover) {
    return {
      source: `/api/roms/${parentId}/pc-components/${component.id}/media/${activeOwnedCover.id}/content`,
    };
  }

  const localCover = component.local_media?.find(
    (media) => media.role === "cover",
  );
  return localCover
    ? { source: `${resourcesPath}/${localCover.owned_path}` }
    : null;
}

export const validDlcMediaSubtabs = [
  "cover",
  "screenshots",
  "artwork",
  "backgrounds",
  "overview-images",
] as const;

export type DlcMediaSubtab = (typeof validDlcMediaSubtabs)[number];

export const dlcMediaNavigationItems = [
  ["cover", "rom.pc-media-role-cover", "mdi-image-check-outline"],
  ["screenshots", "rom.screenshots", "mdi-image-multiple-outline"],
  ["artwork", "rom.artwork", "mdi-palette-outline"],
  ["backgrounds", "rom.active-backgrounds", "mdi-image-multiple-outline"],
  [
    "overview-images",
    "rom.active-overview-images",
    "mdi-view-dashboard-outline",
  ],
] as const;

export function createDlcMediaSubtabDefs(
  translate: (key: string) => string,
): ZATabNavItem[] {
  return dlcMediaNavigationItems.map(([id, label, icon]) => ({
    id,
    label: translate(label),
    icon,
    controls: `pc-dlc-media-panel-${id}`,
    tabId: `pc-dlc-media-tab-${id}`,
  }));
}

export function surfaceCaptionKey(surface: RomOwnedMediaSurface) {
  return surface === "overview"
    ? "rom.screenshots-action-overview"
    : surface === "background"
      ? "rom.screenshots-action-background"
      : "rom.soundtrack";
}

export function surfaceLabelKey(
  surface: RomOwnedMediaSurface,
  isPlaced: boolean,
) {
  if (surface === "soundtrack")
    return isPlaced ? "rom.remove-from-soundtrack" : "rom.add-to-soundtrack";
  if (surface === "overview")
    return isPlaced ? "rom.remove-from-overview" : "rom.add-to-overview";
  return isPlaced ? "rom.remove-as-background" : "rom.add-as-background";
}

export function componentMediaRoleLabel(
  translate: (key: string) => string,
  item: PcComponentOwnedMediaSchema,
) {
  return translate(`rom.pc-media-role-${item.role}`);
}

export function componentMediaSourceLabel(
  translate: (key: string) => string,
  item: PcComponentOwnedMediaSchema,
) {
  if (item.origin === "provider" && item.provider) return item.provider;
  return item.origin === "provider"
    ? translate("rom.pc-media-source-provider")
    : translate("rom.pc-media-source-uploaded");
}
