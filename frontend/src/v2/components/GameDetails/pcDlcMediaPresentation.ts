import type { ZATabNavItem } from "@v2/lib";
import type { RomOwnedMediaSurface } from "@/__generated__";

export const validDlcMediaSubtabs = [
  "manual",
  "screenshots",
  "artwork",
  "soundtrack",
] as const;

export type DlcMediaSubtab = (typeof validDlcMediaSubtabs)[number];

export const dlcMediaNavigationItems = [
  ["manual", "rom.manual", "mdi-book-open-page-variant-outline"],
  ["screenshots", "rom.screenshots", "mdi-image-multiple-outline"],
  ["artwork", "rom.artwork", "mdi-palette-outline"],
  ["soundtrack", "rom.soundtrack", "mdi-music-note-outline"],
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
