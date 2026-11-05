import type { RomOwnedMediaSchema } from "@/__generated__";

/** Supported audio file names are safe local soundtrack candidates. */
export const supportedSoundtrackExtensions = [
  ".mp3",
  ".aac",
  ".flac",
  ".ogg",
  ".opus",
  ".m4a",
  ".wav",
] as const;

export const soundtrackAccept = supportedSoundtrackExtensions.join(",");

export const supportedSoundtrackMimeTypes = [
  "audio/mpeg",
  "audio/aac",
  "audio/flac",
  "audio/ogg",
  "audio/opus",
  "audio/mp4",
  "audio/wav",
];

export function isSupportedSoundtrackFile(fileName: string) {
  const normalizedName = fileName.trim().toLocaleLowerCase();
  return supportedSoundtrackExtensions.some((extension) =>
    normalizedName.endsWith(extension),
  );
}

export function soundtrackPlacement(item: RomOwnedMediaSchema) {
  return item.placements?.find(
    (placement) => placement.surface === "soundtrack",
  );
}
