import type { ZATabNavItem } from "@v2/lib";
import type {
  PcComponentOwnedMediaSchema,
  RomOwnedMediaSurface,
} from "@/__generated__";

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
