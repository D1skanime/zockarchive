import type { SimpleRom } from "@/v2/data/adapters/legacy/stores/roms";
import type { MatchedSource, MatchSearchRom } from "./types";

type ClassicMatchPayload = Pick<
  SimpleRom,
  | "igdb_id"
  | "steam_id"
  | "sgdb_id"
  | "ss_id"
  | "moby_id"
  | "flashpoint_id"
  | "launchbox_id"
  | "libretro_id"
  | "ra_id"
  | "hasheous_id"
  | "tgdb_id"
  | "hltb_id"
  | "name"
  | "name_sort_key"
  | "slug"
  | "summary"
  | "url_cover"
  | "manual_metadata"
>;

/** Normalize a selected classic candidate into the versioned ROM update payload. */
export function createClassicMatchPayload(
  target: SimpleRom,
  matched: MatchSearchRom,
  cover: MatchedSource | undefined,
): SimpleRom {
  const urlCover =
    cover?.url_cover ??
    matched.igdb_url_cover ??
    matched.steam_url_cover ??
    matched.ss_url_cover ??
    matched.moby_url_cover ??
    matched.flashpoint_url_cover ??
    matched.launchbox_url_cover ??
    matched.libretro_url_cover ??
    null;
  return {
    ...target,
    manual_metadata: null,
    igdb_id: matched.igdb_id || null,
    steam_id: matched.steam_id || null,
    ss_id: matched.ss_id || null,
    moby_id: matched.moby_id || null,
    flashpoint_id: matched.flashpoint_id || null,
    launchbox_id: matched.launchbox_id || null,
    libretro_id: matched.libretro_id || null,
    name: matched.name || null,
    slug: matched.slug || null,
    summary: target.summary,
    url_cover: urlCover?.replace("t_cover_big", "t_1080p") ?? null,
  };
}

export function isUnchangedClassicMatchPayload(
  target: ClassicMatchPayload,
  proposed: ClassicMatchPayload,
): boolean {
  return (
    target.igdb_id === proposed.igdb_id &&
    target.steam_id === proposed.steam_id &&
    target.sgdb_id === proposed.sgdb_id &&
    target.ss_id === proposed.ss_id &&
    target.moby_id === proposed.moby_id &&
    target.flashpoint_id === proposed.flashpoint_id &&
    target.launchbox_id === proposed.launchbox_id &&
    target.libretro_id === proposed.libretro_id &&
    target.ra_id === proposed.ra_id &&
    target.hasheous_id === proposed.hasheous_id &&
    target.tgdb_id === proposed.tgdb_id &&
    target.hltb_id === proposed.hltb_id &&
    target.name === proposed.name &&
    target.name_sort_key === proposed.name_sort_key &&
    target.slug === proposed.slug &&
    target.summary === proposed.summary &&
    target.url_cover === proposed.url_cover &&
    target.manual_metadata === proposed.manual_metadata
  );
}
