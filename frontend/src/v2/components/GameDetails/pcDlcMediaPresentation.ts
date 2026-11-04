import type { RomOwnedMediaSurface } from "@/__generated__";

export const validDlcMediaSubtabs = [
  "manual",
  "screenshots",
  "artwork",
  "soundtrack",
] as const;

export type DlcMediaSubtab = (typeof validDlcMediaSubtabs)[number];

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
