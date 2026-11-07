import type {
  PcComponentOwnedMediaSchema,
  RomOwnedMediaSurface,
} from "@/__generated__";

export function componentHasPlacement(
  item: PcComponentOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  return (item.placements ?? []).some(
    (placement) => placement.surface === surface,
  );
}

export function componentPlacementPosition(
  item: PcComponentOwnedMediaSchema,
  surface: RomOwnedMediaSurface,
) {
  const placement = (item.placements ?? []).find(
    (entry) => entry.surface === surface,
  );
  return placement ? placement.position + 1 : undefined;
}

export function movedComponentMediaIds(
  media: PcComponentOwnedMediaSchema[],
  index: number,
  direction: -1 | 1,
) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= media.length) return null;

  const mediaIds = media.map((item) => item.id);
  [mediaIds[index], mediaIds[nextIndex]] = [
    mediaIds[nextIndex],
    mediaIds[index],
  ];
  return mediaIds;
}

export function componentMediaContentUrl(endpoint: string, mediaId: number) {
  return `/api${endpoint}/${mediaId}/content`;
}
